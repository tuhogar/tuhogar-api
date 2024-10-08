import { Controller, Post, Body, Delete } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSubscriptionUseCase } from 'src/application/use-cases/subscription/create-subscription.use-case';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { CreateSubscriptionDto } from '../dtos/subscription/create-subscription.dto';
import { CancelSubscriptionUseCase } from 'src/application/use-cases/subscription/cancel-subscription.use-case';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase) {}

  @ApiBearerAuth()
  @Post()
  @Auth('ADMIN')
  async createSubscription(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.createSubscriptionUseCase.execute({ accountId: authenticatedUser.accountId, planId: createSubscriptionDto.planId });
  }

  @ApiBearerAuth()
  @Delete()
  @Auth('ADMIN')
  async cancelSubscription(@Authenticated() authenticatedUser: AuthenticatedUser) {
    return await this.cancelSubscriptionUseCase.execute({ accountId: authenticatedUser.accountId });
  }
}
