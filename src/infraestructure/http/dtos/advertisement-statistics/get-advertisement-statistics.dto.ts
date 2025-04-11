import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class GetAdvertisementStatisticsDto {
  @ApiProperty({
    description: 'Mês para o qual as estatísticas serão consultadas (formato: YYYY-MM)',
    example: '2025-04'
  })
  @IsNotEmpty({ message: 'invalid.month.should.not.be.empty' })
  @IsString({ message: 'invalid.month.must.be.a.string' })
  @Matches(/^\d{4}-\d{2}$/, { message: 'invalid.month.format' })
  month: string;
}
