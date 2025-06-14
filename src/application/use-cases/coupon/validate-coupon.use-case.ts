import { Injectable } from '@nestjs/common';
import { Coupon } from 'src/domain/entities/coupon';
import { ICouponRepository } from 'src/application/interfaces/repositories/coupon.repository.interface';

interface ValidateCouponUseCaseCommand {
    coupon: string;
}

@Injectable()
export class ValidateCouponUseCase {

    constructor(
        private readonly couponRepository: ICouponRepository,
    ) {}

    async execute({ coupon }: ValidateCouponUseCaseCommand): Promise<Coupon> {
        const couponExists = await this.couponRepository.findOneByCoupon(coupon);
        if (!couponExists) throw new Error('invalid.coupon');
        if (couponExists.expirationDate && couponExists.expirationDate < new Date()) throw new Error('invalid.coupon.expirationDate');

        return couponExists;
    }
}