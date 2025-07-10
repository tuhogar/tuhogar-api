import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class GenerateAdvertisementMonthlyStatisticsDto {
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
}
