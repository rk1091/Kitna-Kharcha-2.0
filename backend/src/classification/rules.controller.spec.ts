import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

const mockRulesService = {
  getAllRules: vi.fn(),
  getRuleById: vi.fn(),
  createRule: vi.fn(),
  updateRule: vi.fn(),
  deleteRule: vi.fn(),
};

describe('RulesController', () => {
  let controller: RulesController;

  beforeEach(() => {
    controller = new RulesController(mockRulesService as unknown as RulesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get all rules for user', async () => {
    const expected = [{ id: 'r1', name: 'Rule 1' }];
    mockRulesService.getAllRules.mockResolvedValue(expected);

    const result = await controller.getAllRules('u1');
    expect(result).toEqual(expected);
    expect(mockRulesService.getAllRules).toHaveBeenCalledWith('u1');
  });

  it('should get rule by id', async () => {
    const expected = { id: 'r1', name: 'Rule 1' };
    mockRulesService.getRuleById.mockResolvedValue(expected);

    const result = await controller.getRuleById('r1', 'u1');
    expect(result).toEqual(expected);
    expect(mockRulesService.getRuleById).toHaveBeenCalledWith('u1', 'r1');
  });

  it('should create a rule', async () => {
    const dto = { name: 'Rule 1', conditions: { keyword: 'swiggy' }, categoryId: 'c1' };
    const expected = { id: 'r1', ...dto };
    mockRulesService.createRule.mockResolvedValue(expected);

    const result = await controller.createRule(dto, 'u1');
    expect(result).toEqual(expected);
    expect(mockRulesService.createRule).toHaveBeenCalledWith('u1', dto);
  });

  it('should update a rule', async () => {
    const dto = { name: 'Rule 1 Updated' };
    const expected = { id: 'r1', name: 'Rule 1 Updated' };
    mockRulesService.updateRule.mockResolvedValue(expected);

    const result = await controller.updateRule('r1', dto, 'u1');
    expect(result).toEqual(expected);
    expect(mockRulesService.updateRule).toHaveBeenCalledWith('u1', 'r1', dto);
  });

  it('should delete a rule', async () => {
    mockRulesService.deleteRule.mockResolvedValue({ success: true, deletedId: 'r1' });

    const result = await controller.deleteRule('r1', 'u1');
    expect(result).toEqual({ success: true, deletedId: 'r1' });
    expect(mockRulesService.deleteRule).toHaveBeenCalledWith('u1', 'r1');
  });
});
