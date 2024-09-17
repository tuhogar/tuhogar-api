import { Injectable } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';

@Injectable()
export class GetAllPlanUseCase {

    constructor(
        private readonly planyRepository: IPlanRepository,
    ) {}

    async execute(): Promise<Plan[]> {
        return this.planyRepository.find();
    }
}