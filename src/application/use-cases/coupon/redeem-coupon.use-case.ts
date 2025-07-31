import { Injectable } from '@nestjs/common';
import { ICouponRepository } from 'src/application/interfaces/repositories/coupon.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { AccountCoupon } from 'src/domain/entities/account-coupon';
import { IAccountCouponRepository } from 'src/application/interfaces/repositories/account-coupon.repository.interface';
import { Coupon } from 'src/domain/entities/coupon';
import { CreateCouponUseCase } from './create-coupon.use-case';

interface RedeemCouponUseCaseCommand {
    coupon: string;
    accountId: string;
}

@Injectable()
export class RedeemCouponUseCase {

    constructor(
        private readonly couponRepository: ICouponRepository,
        private readonly accountRepository: IAccountRepository,
        private readonly accountCouponRepository: IAccountCouponRepository,
        private readonly createCouponUseCase: CreateCouponUseCase,
    ) {}

    async execute({ coupon, accountId }: RedeemCouponUseCaseCommand): Promise<Coupon> {
        // TODO: Remover a chamada abaixo quando os cupons forem criados via admin
        await this.createCouponUseCase.execute({ coupon, accountId });

        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        const couponExists = await this.couponRepository.findOneByCoupon(coupon);
        if (!couponExists) throw new Error('invalid.coupon');
        if (couponExists.expirationDate && couponExists.expirationDate < new Date()) throw new Error('invalid.coupon.expirednDate');
        if (couponExists.isSingleRedemption && couponExists.isRedeemed) throw new Error('invalid.coupon.redeemed');


        const accountCoupon = new AccountCoupon({
            accountId,
            couponId: couponExists.id,
            isDepleted: false,
        })

        await this.accountCouponRepository.create(accountCoupon);

        if (couponExists.isSingleRedemption) {
            await this.couponRepository.redeem(couponExists.id);
        }

        return couponExists;
    }
}