import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedeemCouponUseCase } from 'src/application/use-cases/coupon/redeem-coupon.use-case';
import { ApplyCouponDto } from '../dtos/coupon/apply-coupon.dto';
import { ApplyCouponOutputDtoMapper } from '../dtos/coupon/output/mapper/apply-coupon.output.dto.mapper';
import { ApplyCouponOutputDto } from '../dtos/coupon/output/apply-coupon.output.dto';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';

@ApiTags('v1/coupons')
@Controller('v1/coupons')
export class CouponController {

    constructor(
        private readonly redeemCouponUseCase: RedeemCouponUseCase,
    ) {}

    @ApiBearerAuth()
    @Post('apply')
    @Auth('ADMIN')
    @ApiResponse({
        status: 200,
        description: 'Aplica um cupom',
        type: ApplyCouponOutputDto
    })
    async apply(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() applyCouponDto: ApplyCouponDto): Promise<ApplyCouponOutputDto> {
        const coupon = await this.redeemCouponUseCase.execute({ coupon: applyCouponDto.coupon, accountId: authenticatedUser.accountId });
        return ApplyCouponOutputDtoMapper.toOutputDto(coupon);
    }
}