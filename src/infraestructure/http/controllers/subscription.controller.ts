import { Controller, Post, Body, Delete } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateSubscriptionUseCase } from 'src/application/use-cases/subscription/create-subscription.use-case';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { CreateSubscriptionDto } from '../dtos/subscription/create-subscription.dto';
import { ReceiveSubscriptionNotificationUseCase } from 'src/application/use-cases/subscription/receive-subscription-notification.use-case';

@Controller('v1/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly receiveSubscriptionNotificationUseCase: ReceiveSubscriptionNotificationUseCase) {}

  @ApiBearerAuth()
  @Post()
  @Auth('ADMIN')
  async createSubscription(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.createSubscriptionUseCase.execute({ 
      actualSubscriptionId: authenticatedUser.subscriptionId,
      actualSubscriptionStatus: authenticatedUser.subscriptionStatus,
      actualPlanId: authenticatedUser.planId,
      accountId: authenticatedUser.accountId, 
      email: authenticatedUser.email, 
      planId: createSubscriptionDto.planId, 
      paymentData: createSubscriptionDto.paymentData
    });
  }

  @Post('notifications')
  //@Auth()
  async notification(@Body() body: any) {
    console.log(`-------notification.body: ${new Date()}`);
    console.log(body);
    console.log(`-------notification.body: ${new Date()}`);

    await this.receiveSubscriptionNotificationUseCase.execute(body);
  }
}
