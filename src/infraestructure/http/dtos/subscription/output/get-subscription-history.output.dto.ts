import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Property } from 'src/infraestructure/decorators/property.decorator';

/**
 * DTO para retorno de uma assinatura com seus pagamentos no histórico
 */
export class GetSubscriptionHistoryOutputDto {
  @ApiProperty({ description: 'ID da assinatura' })
  @Property()
  id: string;

  @ApiProperty({ description: 'ID do plano associado à assinatura' })
  @Property()
  planId: string;

  @ApiProperty({ description: 'Status atual da assinatura', enum: SubscriptionStatus })
  @Property()
  status: SubscriptionStatus;

  @ApiProperty({ description: 'Data efetiva de cancelamento da assinatura', required: false, nullable: true })
  @Property()
  effectiveCancellationDate: Date | null;

  @ApiProperty({ description: 'Data do último pagamento realizado', required: false, nullable: true })
  @Property()
  paymentDate: Date | null;

  @ApiProperty({ description: 'Data prevista para o próximo pagamento', required: false, nullable: true })
  @Property()
  nextPaymentDate: Date | null;

  @ApiProperty({ description: 'Data de criação da assinatura', required: false, nullable: true })
  @Property()
  createdAt: Date | null;

  @ApiProperty({ 
    description: 'Detalhes do plano associado à assinatura',
    required: false,
    nullable: true,
    type: 'object',
    properties: {
      id: { type: 'string', description: 'ID do plano' },
      name: { type: 'string', description: 'Nome do plano', nullable: true },
      price: { type: 'number', description: 'Preço do plano' },
      items: { type: 'array', items: { type: 'string' }, description: 'Itens incluídos no plano' },
      freeTrialDays: { type: 'number', description: 'Número de dias gratuitos no período de teste', nullable: true },
      photo: { type: 'string', description: 'URL da foto do plano', nullable: true }
    }
  })
  @Property()
  plan: {
    id: string;
    name: string | null;
    price: number;
    items: string[];
    freeTrialDays: number | null;
    photo: string | null;
  } | null;

  @ApiProperty({ 
    description: 'Pagamentos relacionados à assinatura',
    isArray: true,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID do pagamento' },
        subscriptionId: { type: 'string', description: 'ID da assinatura relacionada' },
        accountId: { type: 'string', description: 'ID da conta do usuário' },
        externalId: { type: 'string', description: 'ID externo do pagamento no gateway de pagamento' },
        type: { type: 'string', description: 'Tipo de pagamento', example: 'subscription' },
        method: { type: 'string', description: 'Método de pagamento', example: 'credit_card' },
        description: { type: 'string', description: 'Descrição do pagamento' },
        amount: { type: 'number', description: 'Valor do pagamento' },
        currency: { type: 'string', description: 'Moeda do pagamento', example: 'COP' },
        status: { type: 'string', enum: Object.values(SubscriptionPaymentStatus), description: 'Status do pagamento' },
        paymentDate: { type: 'string', format: 'date-time', description: 'Data em que o pagamento foi realizado', nullable: true }
      }
    }
  })
  @Property()
  payments: Array<{
    id: string;
    subscriptionId: string;
    accountId: string;
    externalId: string;
    type: string;
    method: string;
    description: string;
    amount: number;
    currency: string;
    status: SubscriptionPaymentStatus;
    paymentDate: Date | null;
  }>;
}
