import { Module } from '@nestjs/common';
import { DedupService } from './dedup.service';
import { FingerprintService } from './fingerprint/fingerprint.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DedupService, FingerprintService],
  exports: [DedupService, FingerprintService],
})
export class DedupModule {}
