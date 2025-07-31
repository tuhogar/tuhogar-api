import { Injectable } from '@nestjs/common';
import { ICouponRepository } from 'src/application/interfaces/repositories/coupon.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { Coupon } from 'src/domain/entities/coupon';
import { CouponType } from 'src/domain/entities/coupon';

interface CreateCouponUseCaseCommand {
    coupon: string;
    accountId: string;
}

@Injectable()
export class CreateCouponUseCase {

    constructor(
        private readonly couponRepository: ICouponRepository,
        private readonly accountRepository: IAccountRepository,
    ) {}

    async execute({ coupon, accountId }: CreateCouponUseCaseCommand): Promise<void> {
        const account = await this.accountRepository.findOneById(accountId);
        if (!account) throw new Error('notfound.account.do.not.exists');

        const couponExists = await this.couponRepository.findOneByCoupon(coupon);
        if (couponExists) throw new Error('invalid.coupon.already.exists');

        const couponCreated = new Coupon({
            coupon,
            type: CouponType.DOCUMENT,
            isSingleRedemption: true,
            doesNotHavePaidPlanIds: [
                { id: '6688484efb777dd43ad8a538', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 }, 
                { id: '68460068facef6cd0ee9d70a', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 }, 
                { id: '6846007cfacef6cd0ee9d70b', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 }, 
                { id: '68460094facef6cd0ee9d70c', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 }],
            hasPaidPlanIds: [
                { id: '6688484efb777dd43ad8a538', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 },
                { id: '684600a1facef6cd0ee9d70d', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 },
                { id: '684600aefacef6cd0ee9d70e', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 },
                { id: '684600bcfacef6cd0ee9d70f', name: '', items: [], price: 0, externalId: '', maxAdvertisements: 0, maxPhotos: 0, discount: 0, oldPrice: 0 }],
            expirationDate: undefined,
            isRedeemed: false,
            allowRepeatedFulfillment: true,
        });

        await this.couponRepository.create(couponCreated);
    }
}