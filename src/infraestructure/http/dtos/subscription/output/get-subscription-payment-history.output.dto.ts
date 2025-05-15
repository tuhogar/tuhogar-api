import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Property } from 'src/infraestructure/decorators/property.decorator';

/**
 * DTO para retorno de um pagamento de assinatura no histórico
 */
export class GetSubscriptionPaymentHistoryOutputDto {
  @ApiProperty({ description: 'ID do pagamento' })
  @Property()
  id: string;

  @ApiProperty({ description: 'Método de pagamento', example: 'VS' })
  @Property()
  method: string;

  @ApiProperty({ description: 'Valor do pagamento' })
  @Property()
  amount: number;

  @ApiProperty({ description: 'Moeda do pagamento', example: 'COP' })
  @Property()
  currency: string;

  @ApiProperty({ description: 'Status do pagamento', enum: SubscriptionPaymentStatus })
  @Property()
  status: SubscriptionPaymentStatus;

  @ApiProperty({ description: 'Data em que o pagamento foi realizado', required: false, nullable: true })
  @Property()
  paymentDate: Date | null;

  @ApiProperty({ 
    description: 'Detalhes da assinatura associada ao pagamento',
    required: false,
    nullable: true,
    type: 'object',
    properties: {
      id: { type: 'string', description: 'ID da assinatura' },
      status: { type: 'string', enum: Object.values(SubscriptionStatus), description: 'Status da assinatura' },
      nextPaymentDate: { type: 'string', format: 'date-time', description: 'Data prevista para o próximo pagamento', nullable: true },
      plan: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID do plano' },
          name: { type: 'string', description: 'Nome do plano' },
          price: { type: 'number', description: 'Preço do plano' }
        },
        nullable: true
      }
    }
  })
  @Property()
  subscription: {
    id: string;
    status: SubscriptionStatus;
    nextPaymentDate: Date | null;
    plan: {
      id: string;
      name: string;
      price: number;
    } | null;
  } | null;
}
