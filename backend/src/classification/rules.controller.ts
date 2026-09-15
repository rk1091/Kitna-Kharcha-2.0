import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RulesService, CreateRuleDto, UpdateRuleDto } from './rules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  async getAllRules(@Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.rulesService.getAllRules(userId);
  }

  @Get(':id')
  async getRuleById(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.rulesService.getRuleById(userId, id);
  }

  @Post()
  async createRule(@Body() dto: CreateRuleDto, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.rulesService.createRule(userId, dto);
  }

  @Patch(':id')
  async updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.rulesService.updateRule(userId, id, dto);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id || 'cmtve5piy0000l5jm13ng5ut5';
    return this.rulesService.deleteRule(userId, id);
  }
}
