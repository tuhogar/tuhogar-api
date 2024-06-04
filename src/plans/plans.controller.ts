import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from './interfaces/plan.interface';

@Controller('v1/plans')
export class PlansController {

    constructor(
        private readonly plansService: PlansService,
    ) {}

    @Get()
    async getAll(): Promise<Plan[]> {
        return this.plansService.getAll();
    }

    @Post()
    async create(@Body() plan: any): Promise<void> {
        await this.plansService.create(plan);
    }
}
