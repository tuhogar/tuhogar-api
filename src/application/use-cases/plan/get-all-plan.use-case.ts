import { Injectable } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ConfigService } from '@nestjs/config';
import { ValidateCouponUseCase } from '../coupon/validate-coupon.use-case';

interface GetAllPlanUseCaseCommand {
    accountId?: string;
    coupon?: string;
}

@Injectable()
export class GetAllPlanUseCase {
    private readonly firstSubscriptionPlanId: string;

    constructor(
        private readonly planRepository: IPlanRepository,
        private readonly accountRepository: IAccountRepository,
        private readonly validateCouponUseCase: ValidateCouponUseCase,
        private readonly configService: ConfigService,
    ) {
        this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
    }

    async execute({ accountId, coupon }: GetAllPlanUseCaseCommand): Promise<Plan[]> {
        if (!accountId && !coupon) {
            return this.planRepository.findOnlyFreeDays();
        }
        
        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        if (!coupon) {
            if (account.hasPaidPlan) {
                return this.planRepository.findNotFreeDays();
            }

            return this.planRepository.findOnlyFreeDays();
        }

        const couponExists = await this.validateCouponUseCase.execute({ coupon });
        let couponPlanIds: string[];
        if (account.hasPaidPlan) {
            couponPlanIds = couponExists.hasPaidPlanIds.map((plan) => plan.id);
        } else {
            couponPlanIds = couponExists.doesNotHavePaidPlanIds.map((plan) => plan.id);
        }
        return this.planRepository.findByIds(couponPlanIds);
    }
}