import { Controller, Post, Body, Delete, Param, Put } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSubscriptionUseCase } from 'src/application/use-cases/subscription/create-subscription.use-case';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { CreateSubscriptionDto } from '../dtos/subscription/create-subscription.dto';
import { ReceiveSubscriptionNotificationUseCase } from 'src/application/use-cases/subscription/receive-subscription-notification.use-case';
import { CancelSubscriptionUseCase } from 'src/application/use-cases/subscription/cancel-subscription.use-case';
import { UpdateSubscriptionDto } from '../dtos/subscription/update-subscription.dto';
import { UpdateSubscriptionPlanUseCase } from 'src/application/use-cases/subscription/update-subscription-plan.use-case';

@Controller('v1/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase,
    private readonly receiveSubscriptionNotificationUseCase: ReceiveSubscriptionNotificationUseCase,
    private readonly cancelSubscriptionUseCase: CancelSubscriptionUseCase) {}

  @ApiBearerAuth()
  @Post()
  @Auth('ADMIN')
  async createSubscription(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto) {
      console.log(`-------createSubscription.body: ${new Date()}`);
      console.log(createSubscriptionDto);
      console.log(`-------createSubscription.body: ${new Date()}`);
    return await this.createSubscriptionUseCase.execute({ 
      actualSubscriptionId: authenticatedUser.subscriptionId,
      actualSubscriptionStatus: authenticatedUser.subscriptionStatus,
      actualPlanId: authenticatedUser.planId,
      accountId: authenticatedUser.accountId, 
      email: authenticatedUser.email, 
      userId: authenticatedUser.userId,
      planId: createSubscriptionDto.planId, 
      paymentData: createSubscriptionDto.paymentData,
    });
  }

  @Post('notifications')
  async notification(@Body() body: any) {
    console.log(`-------notification.body: ${new Date()}`);
    console.log(body);
    console.log(`-------notification.body: ${new Date()}`);

    await this.receiveSubscriptionNotificationUseCase.execute(body);
  }

  @ApiBearerAuth()
  @Delete()
  @Auth('ADMIN')
  async cancelSubscription(@Authenticated() authenticatedUser: AuthenticatedUser) {
    return await this.cancelSubscriptionUseCase.execute({ id: authenticatedUser.subscriptionId, accountId: authenticatedUser.accountId });
  }

  /*
  @ApiBearerAuth()
  @Put('plan')
  @Auth('ADMIN')
  async updateSubscriptionPlan(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
      console.log(`-------updateSubscriptionPlan.body: ${new Date()}`);
      console.log(updateSubscriptionDto);
      console.log(`-------updateSubscriptionPlan.body: ${new Date()}`);
    return await this.updateSubscriptionPlanUseCase.execute({ 
      actualSubscriptionId: authenticatedUser.subscriptionId,
      accountId: authenticatedUser.accountId, 
      planId: updateSubscriptionDto.planId, 
    });
  }
  */
}
