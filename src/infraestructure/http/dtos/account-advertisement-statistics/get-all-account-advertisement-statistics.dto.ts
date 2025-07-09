import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { Property } from 'src/infraestructure/decorators/property.decorator';

export class GetAllAccountAdvertisementStatisticsDto {
  @ApiProperty({
    description: 'ID da conta para filtrar estatísticas (obrigatório para MASTER, ignorado para outros perfis)',
    example: '6073a75d56a1f3001f9d5a2b',
    required: false
  })
  @IsOptional()
  @IsMongoId({ message: 'invalid.accountId' })
  @Property()
  accountId?: string;
}
