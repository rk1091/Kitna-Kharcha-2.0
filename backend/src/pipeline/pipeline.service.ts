import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PipelineService {
  constructor(@InjectQueue('statements') private readonly statementsQueue: Queue) {}

  async addStatementJob(uploadId: string): Promise<void> {
    await this.statementsQueue.add('process-statement', { uploadId });
  }
}
