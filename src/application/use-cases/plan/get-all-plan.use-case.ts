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
        let plansWithDiscounts: string[] = [
            this.firstSubscriptionPlanId,
            "6984f8c7910c769e16465d9f",
        ];

        let plansWithoutDiscounts: string[] = [
            this.firstSubscriptionPlanId,
            "6984fa79910c769e16465da1",
        ];

        if (!accountId) {
            return this.planRepository.findByIds(plansWithoutDiscounts);
        }

        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        const accountCoupon = await this.accountCouponRepository.findLastNotDepletedByAccountId(accountId);
        const coupon = accountCoupon?.coupon;
        const couponExpiredDate = coupon?.expirationDate && coupon.expirationDate < new Date();

        if (coupon && !couponExpiredDate) {
            return this.planRepository.findByIds(plansWithDiscounts);
        }

        return this.planRepository.findByIds(plansWithoutDiscounts);
    }
}