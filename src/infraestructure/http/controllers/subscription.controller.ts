import { Controller, Post, Body, Delete, Param, Put, Get, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubscriptionUseCase } from 'src/application/use-cases/subscription/create-subscription.use-case';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { CreateSubscriptionDto } from '../dtos/subscription/create-subscription.dto';
import { ReceiveSubscriptionNotificationUseCase } from 'src/application/use-cases/subscription/receive-subscription-notification.use-case';
import { CancelSubscriptionOnPaymentGatewayUseCase } from 'src/application/use-cases/subscription/cancel-subscription-on-payment-gateway.use-case';
import { UpdateSubscriptionDto } from '../dtos/subscription/update-subscription.dto';
import { UpdateSubscriptionPlanUseCase } from 'src/application/use-cases/subscription/update-subscription-plan.use-case';
import { GetCurrentSubscriptionUseCase } from 'src/application/use-cases/subscription/get-current-subscription.use-case';
import { GetAllPlanUseCase } from 'src/application/use-cases/plan/get-all-plan.use-case';
import { Plan } from 'src/domain/entities/plan';
import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';
import { GetCurrentSubscriptionOutputDto } from '../dtos/subscription/output/get-current-subscription.output.dto';
import { GetCurrentSubscriptionOutputDtoMapper } from '../dtos/subscription/output/mapper/get-current-subscription.output.dto.mapper';
import { GetAllPlansOutputDto } from '../dtos/plan/output/get-all-plans.output.dto';
import { GetAllPlansOutputDtoMapper } from '../dtos/plan/output/mapper/get-all-plans.output.dto.mapper';

@Controller('v1/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase,
    private readonly receiveSubscriptionNotificationUseCase: ReceiveSubscriptionNotificationUseCase,
    private readonly cancelSubscriptionOnPaymentGatewayUseCase: CancelSubscriptionOnPaymentGatewayUseCase,
    private readonly getCurrentSubscriptionUseCase: GetCurrentSubscriptionUseCase,
    private readonly getAllPlanUseCase: GetAllPlanUseCase) {}

  @ApiBearerAuth()
  @Post()
  @Auth('ADMIN')
  async createSubscription(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto) {
      console.log(`-------createSubscription.body: ${new Date()}`);
      console.log(createSubscriptionDto);
      console.log(`-------createSubscription.body: ${new Date()}`);
    const response = await this.createSubscriptionUseCase.execute({ 
      actualSubscriptionId: authenticatedUser.subscriptionId,
      actualSubscriptionStatus: authenticatedUser.subscriptionStatus,
      actualPlanId: authenticatedUser.planId,
      accountId: authenticatedUser.accountId, 
      email: authenticatedUser.email, 
      userId: authenticatedUser.userId,
      planId: createSubscriptionDto.planId, 
      paymentData: createSubscriptionDto.paymentData,
    });

    return { id: response.id, status: response.status };
  }

  @Post('notifications')
  async notification(@Body() body: any) {
    console.log(`-------post-notification.body: ${new Date()}`);
    console.log(body);
    console.log(`-------post-notification.body: ${new Date()}`);

    await this.receiveSubscriptionNotificationUseCase.execute(body);
  }

  @Get('notifications')
  async getNotification(@Body() body: any) {
    console.log(`-------get-notification.body: ${new Date()}`);
    console.log(body);
    console.log(`-------get-notification.body: ${new Date()}`);

    return HttpStatus.CREATED;
  }

  @ApiBearerAuth()
  @Delete()
  @Auth('ADMIN')
  async cancelSubscription(@Authenticated() authenticatedUser: AuthenticatedUser) {
    return await this.cancelSubscriptionOnPaymentGatewayUseCase.execute({ id: authenticatedUser.subscriptionId, accountId: authenticatedUser.accountId });
  }

  @ApiBearerAuth()
  @Get('current')
  @Auth('ADMIN', 'USER')
  @ApiResponse({
    status: 200,
    description: 'Retorna a assinatura atual do usuário com dias gratuitos restantes',
    type: GetCurrentSubscriptionOutputDto
  })
  async getCurrentSubscription(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<GetCurrentSubscriptionOutputDto> {
    const subscription = await this.getCurrentSubscriptionUseCase.execute({ accountId: authenticatedUser.accountId });
    return GetCurrentSubscriptionOutputDtoMapper.toOutputDto(subscription);
  }

  @ApiBearerAuth()
  @Auth('ADMIN', 'USER')
  @Get('plans')
  async getAllPlansForSubscriptions(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<GetAllPlansOutputDto[]> {
    const plans = await this.getAllPlanUseCase.execute({ accountId: authenticatedUser.accountId });
    return GetAllPlansOutputDtoMapper.toOutputDtoList(plans);
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
