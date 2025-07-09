import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Property } from 'src/infraestructure/decorators/property.decorator';

/**
 * DTO para consulta de estatísticas globais de anúncios
 * Não possui o campo accountId pois as estatísticas são consolidadas para toda a plataforma
 */
export class GetAllAdvertisementStatisticsDto {
  // Este DTO não possui campos específicos pois as estatísticas globais
  // não são filtradas por conta, apenas por mês quando aplicável
}
