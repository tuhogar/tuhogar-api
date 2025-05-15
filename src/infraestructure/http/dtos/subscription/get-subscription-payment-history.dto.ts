import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para receber os parâmetros de paginação para o histórico de pagamentos de assinaturas
 */
export class GetSubscriptionPaymentHistoryDto {
  @ApiPropertyOptional({ description: 'Número da página (começando em 1)', default: 1 })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber({}, { message: 'invalid.page.must.be.a.number.conforming.to.the.specified.constraints' })
  @Type(() => Number)
  @Min(1, { message: 'page.must.not.be.less.than.1' })
  page: number;

  @ApiPropertyOptional({ description: 'Quantidade de itens por página', default: 10 })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber({}, { message: 'invalid.limit.must.be.a.number.conforming.to.the.specified.constraints' })
  @Type(() => Number)
  @Min(1, { message: 'limit.must.not.be.less.than.1' })
  limit: number;
}
