import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Property } from 'src/infraestructure/decorators/property.decorator';

/**
 * DTO para retorno de um pagamento de assinatura
 */
export class SubscriptionPaymentOutputDto {
  @ApiProperty({ description: 'ID do pagamento' })
  @Property()
  id: string;

  @ApiProperty({ description: 'ID da assinatura relacionada' })
  @Property()
  subscriptionId: string;

  @ApiProperty({ description: 'ID da conta do usuário' })
  @Property()
  accountId: string;

  @ApiProperty({ description: 'ID externo do pagamento no gateway de pagamento' })
  @Property()
  externalId: string;

  @ApiProperty({ description: 'Tipo de pagamento', example: 'subscription' })
  @Property()
  type: string;

  @ApiProperty({ description: 'Método de pagamento', example: 'credit_card' })
  @Property()
  method: string;

  @ApiProperty({ description: 'Descrição do pagamento' })
  @Property()
  description: string;

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
}
