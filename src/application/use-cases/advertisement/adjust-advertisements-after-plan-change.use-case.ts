import { Injectable, Logger } from '@nestjs/common';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { AdvertisementStatus } from 'src/domain/entities/advertisement';

/**
 * Interface para o comando de ajuste de anúncios após mudança de plano
 */
export interface AdjustAdvertisementsAfterPlanChangeUseCaseCommand {
  /**
   * ID da conta cujos anúncios serão ajustados
   */
  accountId: string;
  
  /**
   * ID do plano para o qual a conta está migrando
   * Será utilizado para buscar o plano e seus limites
   */
  planId: string;
}

/**
 * Caso de uso responsável por ajustar anúncios após mudança de plano
 * 
 * Realiza duas operações principais:
 * 1. Pausa anúncios com excesso de fotos
 * 2. Limita o número de anúncios ativos de acordo com o plano
 */
@Injectable()
export class AdjustAdvertisementsAfterPlanChangeUseCase {
  private readonly logger = new Logger(AdjustAdvertisementsAfterPlanChangeUseCase.name);

  constructor(
    private readonly advertisementRepository: IAdvertisementRepository,
    private readonly planRepository: IPlanRepository
  ) {}

  /**
   * Executa o ajuste de anúncios após mudança de plano
   * 
   * @param accountId ID da conta cujos anúncios serão ajustados
   * @param planId ID do plano para o qual a conta está migrando
   * @returns Estatísticas das alterações realizadas
   */
  async execute({ accountId, planId }: AdjustAdvertisementsAfterPlanChangeUseCaseCommand): Promise<{
    pausedDueToPhotoLimit: number;
    pausedDueToAdvertisementLimit: number;
    totalActiveAdvertisements: number;
  }> {
    this.logger.log(`Iniciando ajuste automático de anúncios para accountId: ${accountId}`);
    
    try {
      // Buscar o plano para obter os limites
      const plan = await this.planRepository.findOneById(planId);
      if (!plan) {
        throw new Error('notfound.plan.not.found');
      }

      // Verificar se o plano possui as propriedades necessárias
      if (plan.maxPhotos === undefined || plan.maxAdvertisements === undefined) {
        throw new Error('invalid.plan.missing.required.properties');
      }

      // Inicializar contadores
      let pausedDueToPhotoLimit = 0;
      let pausedDueToAdvertisementLimit = 0;
      
      // 1. Pausar anúncios com excesso de fotos
      this.logger.log(`Verificando anúncios com excesso de fotos para accountId: ${accountId}`);
      
      // Buscar anúncios ativos ou aguardando aprovação com excesso de fotos
      const advertisementsWithExcessPhotos = await this.advertisementRepository.findActiveOrWaitingWithExcessPhotos(
        accountId,
        plan.maxPhotos
      );
      
      if (advertisementsWithExcessPhotos.length > 0) {
        this.logger.log(`Encontrados ${advertisementsWithExcessPhotos.length} anúncios com excesso de fotos`);
        
        // Extrair os IDs dos anúncios com excesso de fotos
        const idsToUpdate = advertisementsWithExcessPhotos.map(ad => ad.id);
        
        // Atualizar status dos anúncios para PAUSED_BY_APPLICATION
        await this.advertisementRepository.updateStatus(
          idsToUpdate,
          accountId,
          AdvertisementStatus.PAUSED_BY_APPLICATION,
          null,
          null
        );
        
        pausedDueToPhotoLimit = advertisementsWithExcessPhotos.length;
        this.logger.log(`${pausedDueToPhotoLimit} anúncios pausados por excederem o limite de fotos`);
      } else {
        this.logger.log('Nenhum anúncio com excesso de fotos encontrado');
      }
      
      // 2. Limitar número de anúncios ativos
      this.logger.log(`Verificando limite de anúncios ativos para accountId: ${accountId}`);
      
      // Verificar se o plano tem um limite de anúncios definido e maior que zero
      if (plan.maxAdvertisements > 0) {
        // Buscar todos os anúncios ativos ou aguardando aprovação ordenados por data de atualização (mais recentes primeiro)
        // Usamos o método de ordenação flexível para permitir futuras mudanças na regra de ordenação
        const activeAdvertisements = await this.advertisementRepository.findActiveOrWaitingByAccountIdWithOrder(
          accountId,
          'updatedAt',  // Ordenar por data de atualização
          'desc'       // Ordem decrescente (mais recentes primeiro)
        );
        
        // Verificar se o número de anúncios excede o limite do plano
        if (activeAdvertisements.length > plan.maxAdvertisements) {
          this.logger.log(`Encontrados ${activeAdvertisements.length} anúncios ativos, limite do plano: ${plan.maxAdvertisements}`);
          
          // Calcular quantos anúncios precisam ser pausados
          const excessAdvertisements = activeAdvertisements.length - plan.maxAdvertisements;
          
          // Selecionar os anúncios mais recentes para pausar (os primeiros da lista, já que está ordenada por data decrescente)
          const advertisementsToPause = activeAdvertisements.slice(0, excessAdvertisements);
          
          // Extrair os IDs dos anúncios a serem pausados
          const idsToUpdate = advertisementsToPause.map(ad => ad.id);
          
          // Atualizar status dos anúncios para PAUSED_BY_APPLICATION
          await this.advertisementRepository.updateStatus(
            idsToUpdate,
            accountId,
            AdvertisementStatus.PAUSED_BY_APPLICATION,
            null,
            null
          );
          
          pausedDueToAdvertisementLimit = advertisementsToPause.length;
          this.logger.log(`${pausedDueToAdvertisementLimit} anúncios mais recentes pausados por excederem o limite de anúncios ativos`);
        } else {
          this.logger.log(`Número de anúncios ativos (${activeAdvertisements.length}) está dentro do limite do plano (${plan.maxAdvertisements})`);
        }
      } else {
        this.logger.log(`Plano sem limite de anúncios ativos ou com limite zero`);
      }

      // Obter número total de anúncios ativos após o ajuste
      const totalActiveAdvertisements = await this.advertisementRepository.countActiveOrWaitingByAccountId(accountId);

      this.logger.log(`Ajuste automático de anúncios concluído com sucesso para accountId: ${accountId}`);
      
      // Retornar estatísticas do ajuste
      return {
        pausedDueToPhotoLimit,
        pausedDueToAdvertisementLimit,
        totalActiveAdvertisements
      };
    } catch (error) {
      this.logger.error(`Erro durante o ajuste automático de anúncios: ${error.message}`);
      throw error;
    }
  }
}
