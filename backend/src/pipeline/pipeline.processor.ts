import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MaskingService } from '../masking/masking.service';
import { ParserService } from '../parser/parser.service';
import { DedupService } from '../dedup/dedup.service';
import { CurrencyService } from '../currency/currency.service';
import { ClassificationService } from '../classification/classification.service';
import { Injectable, Logger } from '@nestjs/common';
import { Direction, Transaction, ClassificationReason } from '@prisma/client';

@Injectable()
@Processor('statements')
export class PipelineProcessor extends WorkerHost {
  private readonly logger = new Logger(PipelineProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly maskingService: MaskingService,
    private readonly parserService: ParserService,
    private readonly dedupService: DedupService,
    private readonly currencyService: CurrencyService,
    private readonly classificationService: ClassificationService,
  ) {
    super();
  }

  async process(job: Job<{ uploadId: string }, void, string>): Promise<void> {
    const { uploadId } = job.data;
    
    // 1. Fetch upload
    const statement = await this.prisma.statementUpload.findUnique({
      where: { id: uploadId },
      include: { user: true },
    });

    if (!statement) {
      throw new Error(`Statement with id ${uploadId} not found`);
    }

    try {
      // 2. Read file (stubbed)
      const fileContent = 'Simulated content';

      // 3. Masking
      const maskResult = await this.maskingService.mask(fileContent);

      // 4. Parsing
      const parseResult = await this.parserService.parse(maskResult.maskedText);

      // Fetch rules and categories for classification
      const rules = await this.prisma.classificationRule.findMany({
        where: { userId: statement.userId },
      });
      const categories = await this.prisma.category.findMany();

      // 5. Iterate transactions
      for (const parsedTxn of parseResult.transactions) {
        // Prepare dummy transaction for classification / dedup
        const direction = parsedTxn.type === 'CREDIT' ? Direction.CREDIT : Direction.DEBIT;
        
        const partialTxn = {
          statementId: statement.id,
          txnDate: parsedTxn.date,
          description: parsedTxn.description,
          maskedDescription: parsedTxn.description,
          normalizedDescription: parsedTxn.description,
          direction,
          amountSigned: direction === Direction.CREDIT ? parsedTxn.amount : -parsedTxn.amount,
        };

        const isDup = await this.dedupService.isDuplicate(partialTxn, statement.userId, statement.bankName || undefined);
        
        const currency = this.currencyService.detectCurrency(parsedTxn.description);
        const baseAmount = await this.currencyService.convertToBase(parsedTxn.amount, currency, statement.user.defaultCurrency);

        const classResult = await this.classificationService.classify(partialTxn as unknown as Transaction, rules, categories);

        // Save to DB
        await this.prisma.transaction.create({
          data: {
            statementId: statement.id,
            txnDate: parsedTxn.date,
            description: parsedTxn.description,
            maskedDescription: parsedTxn.description,
            normalizedDescription: parsedTxn.description,
            direction,
            amountSigned: partialTxn.amountSigned,
            debitAmount: direction === Direction.DEBIT ? baseAmount : null,
            creditAmount: direction === Direction.CREDIT ? baseAmount : null,
            balance: parsedTxn.balance || null,
            currency,
            categoryId: classResult.categoryId || null,
            classificationReason: classResult.reason as ClassificationReason,
            classificationConfidence: classResult.confidence,
            isDuplicate: isDup,
            tags: classResult.tags || [],
          }
        });
      }

      await this.prisma.statementUpload.update({
        where: { id: statement.id },
        data: { parseStatus: 'COMPLETED', healthScore: parseResult.healthScore },
      });

    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to process statement ${uploadId}`, err.stack);
      await this.prisma.statementUpload.update({
        where: { id: uploadId },
        data: { parseStatus: 'FAILED', errorMessage: err.message },
      });
      throw err;
    }
  }
}
