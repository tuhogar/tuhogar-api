import { AdvertisementStatistics } from "src/domain/entities/advertisement-statistics";

export abstract class IAdvertisementStatisticsRepository {
  /**
   * Cria um novo registro de estatísticas de anúncios consolidadas
   * @param advertisementStatistics Estatísticas a serem salvas
   * @returns O registro de estatísticas salvo
   */
  abstract create(advertisementStatistics: AdvertisementStatistics): Promise<AdvertisementStatistics>;

  /**
   * Busca estatísticas de anúncios consolidadas por mês
   * @param month Mês no formato YYYY-MM
   * @returns Estatísticas encontradas ou null se não existir
   */
  abstract findByMonth(month: string): Promise<AdvertisementStatistics | null>;

  /**
   * Lista todos os meses que possuem estatísticas de anúncios consolidadas
   * @returns Array de strings no formato YYYY-MM
   */
  abstract findAllMonths(): Promise<string[]>;

  /**
   * Atualiza estatísticas de anúncios consolidadas existentes
   * @param advertisementStatistics Estatísticas atualizadas
   * @returns Estatísticas atualizadas
   */
  abstract update(id: string, advertisementStatistics: AdvertisementStatistics): Promise<AdvertisementStatistics>;
}
