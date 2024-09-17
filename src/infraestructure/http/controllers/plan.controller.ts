import { Body, Controller, Get, Post } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { CreatePlanUseCase } from 'src/application/use-cases/plan/create-plan.use-case';
import { GetAllPlanUseCase } from 'src/application/use-cases/plan/get-all-plan.use-case';

@ApiTags('v1/plans')
@Controller('v1/plans')
export class PlanController {

    constructor(
        private readonly createPlanUseCase: CreatePlanUseCase,
        private readonly getAllPlanUseCase: GetAllPlanUseCase,
    ) {}

    @Get()
    async getAll(): Promise<Plan[]> {
        return this.getAllPlanUseCase.execute();
    }

    @Post()
    @Auth('MASTER')
    async create(@Body() createPlanDto: CreatePlanDto): Promise<{ _id: string }> {
        const response = await this.createPlanUseCase.execute(createPlanDto);
        if (!response) return null;

        return { _id: response._id };
    }
}