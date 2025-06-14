import { Plan } from 'src/domain/entities/plan';
import { GetAllPlansOutputDto } from '../get-all-plans.output.dto';

/**
 * Mapeador responsável por converter a entidade Plan para o DTO de saída GetAllPlansOutputDto
 */
export class GetAllPlansOutputDtoMapper {
  /**
   * Converte uma entidade Plan para o DTO de saída GetAllPlansOutputDto
   * @param plan Entidade Plan a ser convertida
   * @returns DTO de saída GetAllPlansOutputDto
   */
  public static toOutputDto(plan: Plan): GetAllPlansOutputDto {
    if (!plan) return null;
    
    return {
      id: plan.id,
      name: plan.name,
      freeTrialDays: plan.freeTrialDays || null,
      items: plan.items || [],
      oldPrice: plan.oldPrice || null,
      price: plan.price,
      discount: plan.discount || null,
      maxAdvertisements: plan.maxAdvertisements,
      maxPhotos: plan.maxPhotos,
      photo: plan.photo || null
    };
  }

  /**
   * Converte uma lista de entidades Plan para uma lista de DTOs de saída GetAllPlansOutputDto
   * @param plans Lista de entidades Plan a serem convertidas
   * @returns Lista de DTOs de saída GetAllPlansOutputDto
   */
  public static toOutputDtoList(plans: Plan[]): GetAllPlansOutputDto[] {
    if (!plans || !Array.isArray(plans)) return [];
    
    return plans.map(plan => this.toOutputDto(plan));
  }
}
