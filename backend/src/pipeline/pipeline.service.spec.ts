import { Queue } from 'bullmq';
import { PipelineService } from './pipeline.service';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('PipelineService', () => {
  let service: PipelineService;
  let mockQueue: Queue;

  beforeEach(() => {
    mockQueue = {
      add: vi.fn().mockResolvedValue({ id: 'jobId' }),
    } as unknown as Queue;
    service = new PipelineService(mockQueue);
  });

  it('should add statement job to queue', async () => {
    await service.addStatementJob('upload123');
    expect(mockQueue.add).toHaveBeenCalledWith('process-statement', { uploadId: 'upload123' });
  });
});
