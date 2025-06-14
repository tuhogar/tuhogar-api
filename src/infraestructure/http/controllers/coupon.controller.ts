import { Body, Controller, Get, Post } from '@nestjs/common';
import { Plan } from 'src/domain/entities/plan';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreatePlanDto } from 'src/infraestructure/http/dtos/plan/create-plan.dto';
import { CreatePlanUseCase } from 'src/application/use-cases/plan/create-plan.use-case';
import { GetAllPlanUseCase } from 'src/application/use-cases/plan/get-all-plan.use-case';
import { GetAllPlansOutputDto } from 'src/infraestructure/http/dtos/plan/output/get-all-plans.output.dto';
import { GetAllPlansOutputDtoMapper } from 'src/infraestructure/http/dtos/plan/output/mapper/get-all-plans.output.dto.mapper';
import { ValidateCouponUseCase } from 'src/application/use-cases/coupon/validate-coupon.use-case';
import { Coupon } from 'src/domain/entities/coupon';
import { ValidateCouponDto } from '../dtos/coupon/validate-coupon.dto';
import { ValidateCouponOutputDtoMapper } from '../dtos/coupon/output/mapper/validate-coupon.output.dto.mapper';
import { ValidateCouponOutputDto } from '../dtos/coupon/output/validate-coupon.output.dto';

@ApiTags('v1/coupons')
@Controller('v1/coupons')
export class CouponController {

    constructor(
        private readonly validateCouponUseCase: ValidateCouponUseCase,
    ) {}

    @Post()
    @ApiResponse({
        status: 200,
        description: 'Valida um cupom',
        type: ValidateCouponOutputDto
    })
    async validate(@Body() validateCouponDto: ValidateCouponDto): Promise<ValidateCouponOutputDto> {
        const coupon = await this.validateCouponUseCase.execute({ coupon: validateCouponDto.coupon });
        return ValidateCouponOutputDtoMapper.toOutputDto(coupon);
    }
}