import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Plan } from './interfaces/plan.interface';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { CreatePlanDto } from './dtos/create-plan.dto';

@ApiTags('v1/plans')
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
    @Auth('MASTER')
    async create(@Body() createPlanDto: CreatePlanDto): Promise<void> {
        await this.plansService.create(createPlanDto);
    }
}
