import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RulesService, CreateRuleDto, UpdateRuleDto } from './rules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  async getAllRules(@CurrentUser() userId: string) {
    return this.rulesService.getAllRules(userId);
  }

  @Get(':id')
  async getRuleById(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.rulesService.getRuleById(userId, id);
  }

  @Post()
  async createRule(@Body() dto: CreateRuleDto, @CurrentUser() userId: string) {
    return this.rulesService.createRule(userId, dto);
  }

  @Patch(':id')
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
    @CurrentUser() userId: string,
  ) {
    return this.rulesService.updateRule(userId, id, dto);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string, @CurrentUser() userId: string) {
    return this.rulesService.deleteRule(userId, id);
  }
}
