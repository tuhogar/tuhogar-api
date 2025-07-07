import { Injectable } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { IAccountCouponRepository } from 'src/application/interfaces/repositories/account-coupon.repository.interface';
import { ConfigService } from '@nestjs/config';

interface GetAllPlanUseCaseCommand {
    accountId?: string;
}

@Injectable()
export class GetAllPlanUseCase {
    private readonly firstSubscriptionPlanId: string;

    constructor(
        private readonly planRepository: IPlanRepository,
        private readonly accountRepository: IAccountRepository,
        private readonly accountCouponRepository: IAccountCouponRepository,
        private readonly configService: ConfigService,
    ) {
        this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
    }

    async execute({ accountId }: GetAllPlanUseCaseCommand): Promise<Plan[]> {
        if (!accountId) {
            return this.planRepository.findOnlyFreeDays();
        }
        
        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        const accountCoupon = await this.accountCouponRepository.findLastNotDepletedByAccountId(accountId);
        const coupon = accountCoupon?.coupon;
        const couponExpiredDate = coupon?.expirationDate && coupon.expirationDate < new Date();

        if (coupon && !couponExpiredDate) {
            let couponPlanIds: string[];
            if (account.hasPaidPlan) {
                couponPlanIds = coupon.hasPaidPlanIds.map((plan) => plan.id);
            } else {
                couponPlanIds = coupon.doesNotHavePaidPlanIds.map((plan) => plan.id);
            }
            return this.planRepository.findByIds(couponPlanIds);
        }

        if (account.hasPaidPlan) {
            return this.planRepository.findNotFreeDays();
        }

        return this.planRepository.findOnlyFreeDays();
    }
}