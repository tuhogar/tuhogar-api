import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlanService } from 'src/application/use-cases/plan/plan.service';
import { Plan } from 'src/domain/entities/plan.interface';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';

@ApiTags('v1/plans')
@Controller('v1/plans')
export class PlanController {

    constructor(
        private readonly planService: PlanService,
    ) {}

    @Get()
    async getAll(): Promise<Plan[]> {
        return this.planService.getAll();
    }

    @Post()
    @Auth('MASTER')
    async create(@Body() createPlanDto: CreatePlanDto): Promise<void> {
        await this.planService.create(createPlanDto);
    }
}