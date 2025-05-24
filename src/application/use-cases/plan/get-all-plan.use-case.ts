import { Injectable } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface GetAllPlanUseCaseCommand {
    accountId?: string;
}

@Injectable()
export class GetAllPlanUseCase {

    constructor(
        private readonly planyRepository: IPlanRepository,
        private readonly accountRepository: IAccountRepository,
    ) {}

    async execute({ accountId }: GetAllPlanUseCaseCommand): Promise<Plan[]> {
        if (!accountId) {
            return this.planyRepository.findOnlyFreeDays();
        }
        
        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        if (account.hasPaidPlan) {
            return this.planyRepository.findNotFreeDays();
        }

        return this.planyRepository.findOnlyFreeDays();
    }
}