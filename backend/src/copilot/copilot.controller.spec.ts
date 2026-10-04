import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';

describe('CopilotController', () => {
  let controller: CopilotController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      askCopilot: vi.fn(),
      getSessionHistory: vi.fn(),
      clearSessionHistory: vi.fn(),
    };

    controller = new CopilotController(serviceMock as unknown as CopilotService);
  });

  it('should return answer when asking copilot', async () => {
    serviceMock.askCopilot.mockResolvedValue('Here is your financial report');

    const res = await controller.ask('Analyze spending', 'u1');
    expect(res).toEqual({ answer: 'Here is your financial report' });
    expect(serviceMock.askCopilot).toHaveBeenCalledWith('u1', 'Analyze spending');
  });

  it('should retrieve conversation history', async () => {
    serviceMock.getSessionHistory.mockResolvedValue([
      { role: 'user', content: 'Hi' },
      { role: 'ai', content: 'Hello!' },
    ]);

    const res = await controller.getHistory('u1');
    expect(res.messages).toHaveLength(2);
    expect(serviceMock.getSessionHistory).toHaveBeenCalledWith('u1');
  });

  it('should clear conversation history', async () => {
    serviceMock.clearSessionHistory.mockResolvedValue({ success: true });

    const res = await controller.clearHistory('u1');
    expect(res).toEqual({ success: true });
    expect(serviceMock.clearSessionHistory).toHaveBeenCalledWith('u1');
  });
});
