import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { Property } from 'src/infraestructure/decorators/property.decorator';

/**
 * DTO para retorno da assinatura atual com dias gratuitos restantes
 */
export class GetCurrentSubscriptionOutputDto {
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
  
  @ApiProperty({ description: 'Número de dias gratuitos restantes na assinatura' })
  @Property()
  remainingFreeDays: number;
}
