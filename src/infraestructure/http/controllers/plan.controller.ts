import { Body, Controller, Get, Post } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { CreatePlanUseCase } from 'src/application/use-cases/plan/create-plan.use-case';
import { GetAllPlanUseCase } from 'src/application/use-cases/plan/get-all-plan.use-case';
import { GetAllPlansOutputDto } from 'src/infraestructure/http/dtos/plan/output/get-all-plans.output.dto';
import { GetAllPlansOutputDtoMapper } from 'src/infraestructure/http/dtos/plan/output/mapper/get-all-plans.output.dto.mapper';

@ApiTags('v1/plans')
@Controller('v1/plans')
export class PlanController {

    constructor(
        private readonly createPlanUseCase: CreatePlanUseCase,
        private readonly getAllPlanUseCase: GetAllPlanUseCase,
    ) {}

    @Get()
    @ApiResponse({
        status: 200,
        description: 'Retorna a lista de planos disponíveis',
        type: [GetAllPlansOutputDto]
    })
    async getAll(): Promise<GetAllPlansOutputDto[]> {
        const plans = await this.getAllPlanUseCase.execute({});
        return GetAllPlansOutputDtoMapper.toOutputDtoList(plans);
    }

    @ApiBearerAuth()
    @Post()
    @Auth('MASTER')
    async create(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
        const response = await this.createPlanUseCase.execute(createPlanDto);
        if (!response) return null;

        return response;
    }
}