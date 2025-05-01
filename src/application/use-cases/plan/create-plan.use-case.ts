import { Injectable } from '@nestjs/common';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { Plan } from 'src/domain/entities/plan';

interface CreatePlanUseCaseCommand {
    name: string,
    freeTrialDays?: number,
    items: string[],
    price: number,
    externalId: string,
}

@Injectable()
export class CreatePlanUseCase {

    constructor(
        private readonly planRepository: IPlanRepository,
    ) {}

    async execute({
        name,
        freeTrialDays,
        items,
        price,
        externalId,
    }: CreatePlanUseCaseCommand): Promise<Plan> {
        const plan = new Plan({
            name,
            freeTrialDays,
            items,
            price,
            externalId,
        })

        const response = await this.planRepository.create(plan);
        return response;
    }
}