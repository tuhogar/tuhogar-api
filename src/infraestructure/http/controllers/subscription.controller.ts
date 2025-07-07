import { Controller, Post, Body, Delete, Put, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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
import { GetSubscriptionHistoryUseCase } from 'src/application/use-cases/subscription/get-subscription-history.use-case';
import { GetSubscriptionPaymentHistoryUseCase } from 'src/application/use-cases/subscription/get-subscription-payment-history.use-case';
import { GetAllPlanUseCase } from 'src/application/use-cases/plan/get-all-plan.use-case';
import { GetCurrentSubscriptionOutputDto } from '../dtos/subscription/output/get-current-subscription.output.dto';
import { GetCurrentSubscriptionOutputDtoMapper } from '../dtos/subscription/output/mapper/get-current-subscription.output.dto.mapper';
import { GetSubscriptionHistoryOutputDto } from '../dtos/subscription/output/get-subscription-history.output.dto';
import { GetSubscriptionHistoryOutputDtoMapper } from '../dtos/subscription/output/mapper/get-subscription-history.output.dto.mapper';
import { GetSubscriptionPaymentHistoryOutputDto } from '../dtos/subscription/output/get-subscription-payment-history.output.dto';
import { GetSubscriptionPaymentHistoryOutputDtoMapper } from '../dtos/subscription/output/mapper/get-subscription-payment-history.output.dto.mapper';
import { GetAllPlansOutputDto } from '../dtos/plan/output/get-all-plans.output.dto';
import { GetAllPlansOutputDtoMapper } from '../dtos/plan/output/mapper/get-all-plans.output.dto.mapper';
import { GetSubscriptionPaymentHistoryDto } from '../dtos/subscription/get-subscription-payment-history.dto';
import { UpdateSubscriptionVipPlanUseCase } from 'src/application/use-cases/subscription/update-subscription-vip-plan.use-case';

@Controller('v1/subscriptions')
export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
    private readonly updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase,
    private readonly receiveSubscriptionNotificationUseCase: ReceiveSubscriptionNotificationUseCase,
    private readonly cancelSubscriptionOnPaymentGatewayUseCase: CancelSubscriptionOnPaymentGatewayUseCase,
    private readonly getCurrentSubscriptionUseCase: GetCurrentSubscriptionUseCase,
    private readonly getSubscriptionHistoryUseCase: GetSubscriptionHistoryUseCase,
    private readonly getSubscriptionPaymentHistoryUseCase: GetSubscriptionPaymentHistoryUseCase,
    private readonly updateSubscriptionVipPlanUseCase: UpdateSubscriptionVipPlanUseCase,
    private readonly getAllPlanUseCase: GetAllPlanUseCase) {}

  @ApiBearerAuth()
  @Post()
  @Auth('ADMIN')
  async createSubscription(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() createSubscriptionDto: CreateSubscriptionDto) {

      const date = new Date(Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
        new Date().getUTCHours(),
        new Date().getUTCMinutes(),
        new Date().getUTCSeconds(),
        new Date().getUTCMilliseconds()
      ));
      
      console.log(`-------createSubscription.body: ${date.toISOString()} (UTC)`);
      console.log(createSubscriptionDto);
      console.log(`-------createSubscription.body: ${date.toISOString()} (UTC)`);
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
    const date = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds(),
      new Date().getUTCMilliseconds()
    ));
    console.log(`-------post-notification.body: ${date.toISOString()} (UTC)`);
    console.log(body);
    console.log(`-------post-notification.body: ${date.toISOString()} (UTC)`);

    await this.receiveSubscriptionNotificationUseCase.execute(body);
  }

  @Get('notifications')
  async getNotification(@Body() body: any) {
    const date = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds(),
      new Date().getUTCMilliseconds()
    ));

    console.log(`-------get-notification.body: ${date.toISOString()} (UTC)`);
    console.log(body);
    console.log(`-------get-notification.body: ${date.toISOString()} (UTC)`);

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
  @Auth('ADMIN')
  @Get('plans')
  async getAllPlansForSubscriptions(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<GetAllPlansOutputDto[]> {
    const plans = await this.getAllPlanUseCase.execute({ accountId: authenticatedUser.accountId });
    return GetAllPlansOutputDtoMapper.toOutputDtoList(plans);
  }

  @ApiBearerAuth()
  @Get('history')
  @Auth('ADMIN', 'USER')
  @ApiResponse({
    status: 200,
    description: 'Retorna o histórico completo de assinaturas do usuário com seus pagamentos',
    type: [GetSubscriptionHistoryOutputDto]
  })
  async getSubscriptionHistory(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<GetSubscriptionHistoryOutputDto[]> {
    const subscriptionsWithPayments = await this.getSubscriptionHistoryUseCase.execute({ accountId: authenticatedUser.accountId });
    return GetSubscriptionHistoryOutputDtoMapper.toOutputDtoList(subscriptionsWithPayments);
  }

  @ApiBearerAuth()
  @Get('payments/history')
  @Auth('ADMIN', 'USER')
  @ApiResponse({
    status: 200,
    description: 'Retorna o histórico de pagamentos de assinaturas do usuário com paginação',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/GetSubscriptionPaymentHistoryOutputDto' }
        },
        count: {
          type: 'number',
          description: 'Total de pagamentos encontrados'
        }
      }
    }
  })
  async getSubscriptionPaymentHistory(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Query() query: GetSubscriptionPaymentHistoryDto
  ): Promise<{ data: GetSubscriptionPaymentHistoryOutputDto[], count: number }> {
    // Extrair page e limit do DTO, com valores padrão
    const page = query.page || 1;
    const limit = query.limit || 10;
    
    // Chamar o caso de uso
    const { data, count } = await this.getSubscriptionPaymentHistoryUseCase.execute({
      accountId: authenticatedUser.accountId,
      page,
      limit
    });
    
    // Mapear os resultados e retornar no formato esperado
    return {
      data: GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDtoList(data),
      count
    };
  }

  @ApiBearerAuth()
  @Put('vip-plan')
  @Auth('MASTER')
  async updateSubscriptionPlan(@Body() { planId, accountId, nextPaymentDate }: { planId: string, accountId: string, nextPaymentDate?: string }) {
    return await this.updateSubscriptionVipPlanUseCase.execute({ planId, accountId, nextPaymentDate });
  }

  /*
  @ApiBearerAuth()
  @Put('plan')
  @Auth('ADMIN')
  async updateSubscriptionPlan(
    @Authenticated() authenticatedUser: AuthenticatedUser,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    const date = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds(),
      new Date().getUTCMilliseconds()
    ));

    console.log(`-------updateSubscriptionPlan.body: ${date.toISOString()} (UTC)`);
    console.log(updateSubscriptionDto);
    console.log(`-------updateSubscriptionPlan.body: ${date.toISOString()} (UTC)`);
    return await this.updateSubscriptionPlanUseCase.execute({ 
      actualSubscriptionId: authenticatedUser.subscriptionId,
      accountId: authenticatedUser.accountId, 
      planId: updateSubscriptionDto.planId, 
    });
  }
  */
}
