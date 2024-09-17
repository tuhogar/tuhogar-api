import { Injectable } from '@nestjs/common';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { Plan } from 'src/domain/entities/plan';

interface CreatePlanUseCaseCommand {
    name: string,
    duration: number,
    items: string[],
    price: number,
}

@Injectable()
export class CreatePlanUseCase {

    constructor(
        private readonly planyRepository: IPlanRepository,
    ) {}

    async execute({
        name,
        duration,
        items,
        price,
    }: CreatePlanUseCaseCommand): Promise<Plan> {

        const plan = new Plan({
            name,
            duration,
            items,
            price,
        })

        const response = await this.planyRepository.create(plan);

        return response;
    }
}