import { Injectable } from '@nestjs/common';
import { ICouponRepository } from 'src/application/interfaces/repositories/coupon.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { AccountCoupon } from 'src/domain/entities/account-coupon';
import { IAccountCouponRepository } from 'src/application/interfaces/repositories/account-coupon.repository.interface';
import { Coupon } from 'src/domain/entities/coupon';

interface ApplyCouponUseCaseCommand {
    coupon: string;
    accountId: string;
}

@Injectable()
export class ApplyCouponUseCase {

    constructor(
        private readonly couponRepository: ICouponRepository,
        private readonly accountRepository: IAccountRepository,
        private readonly accountCouponRepository: IAccountCouponRepository,
    ) {}

    async execute({ coupon, accountId }: ApplyCouponUseCaseCommand): Promise<Coupon> {
        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        const couponExists = await this.couponRepository.findOneByCoupon(coupon);
        if (!couponExists) throw new Error('invalid.coupon');
        if (couponExists.expirationDate && couponExists.expirationDate < new Date()) throw new Error('invalid.coupon.expirednDate');
        if (couponExists.singleUse && couponExists.singleUseApplied) throw new Error('invalid.coupon.applied');


        const accountCoupon = new AccountCoupon({
            accountId,
            couponId: couponExists.id,
            used: false,
        })

        await this.accountCouponRepository.create(accountCoupon);

        if (couponExists.singleUse) {
            await this.couponRepository.apply(couponExists.id);
        }

        return couponExists;
    }
}