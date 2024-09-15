import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

@Injectable()
export class CreatePlanUseCase {

    constructor(
        private readonly planyRepository: IPlanRepository,
    ) {}

    async execute(createPlanDto: CreatePlanDto): Promise<void> {
        await this.planyRepository.create(createPlanDto);
    }
}