import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, Matches } from 'class-validator';

export class GenerateAccountAdvertisementMonthlyStatisticsDto {
  @ApiPropertyOptional({
    description: 'Mês para o qual as estatísticas serão geradas (formato: YYYY-MM)',
    example: '2025-04'
  })
  @IsOptional()
  @IsString({ message: 'invalid.month.must.be.a.string' })
  @Matches(/^\d{4}-\d{2}$/, { 
    message: 'invalid.month.format',
    each: false
  })
  month?: string;

  @ApiPropertyOptional({
    description: 'ID da conta para a qual as estatísticas serão geradas. Se não fornecido, gera para todas as contas ativas.',
    example: '6071f2d5e4b09e5c9b8d1234'
  })
  @IsOptional()
  @IsMongoId({ message: 'invalid.accountId' })
  accountId?: string;
}
