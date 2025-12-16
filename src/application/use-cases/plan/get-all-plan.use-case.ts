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
            "692a6d7b7e32d4b2b3423562",
            "692a6dda7e32d4b2b3423563",
            "692a6e027e32d4b2b3423564",
        ];

        let plansWithoutDiscounts: string[] = [
            this.firstSubscriptionPlanId,
            "692a6e1d7e32d4b2b3423565",
            "692a6e367e32d4b2b3423566",
            "692a6e4d7e32d4b2b3423567",
        ];

        console.log('----accountId; ', accountId);

        if (!accountId) {
            return this.planRepository.findByIds(plansWithoutDiscounts);
        }

        if (accountId === '691e32ae5492055a1f83e58f') {
            plansWithoutDiscounts = ['694189908cb266c438999938'];
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