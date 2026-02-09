import { BlacklistWord } from 'src/domain/entities/blacklist-word';
import { GetAllBlacklistWordsOutputDto } from '../get-all-blacklist-words.output.dto';

/**
 * Mapeador responsável por converter a entidade BlacklistWord para o DTO de saída GetAllBlacklistWordsOutputDto
 */
export class GetAllBlacklistWordsOutputDtoMapper {
  /**
   * Converte uma entidade BlacklistWord para o DTO de saída GetAllBlacklistWordsOutputDto
   * @param blacklistWord Entidade BlacklistWord a ser convertida
   * @returns DTO de saída GetAllBlacklistWordsOutputDto
   */
  public static toOutputDto(blacklistWord: BlacklistWord): GetAllBlacklistWordsOutputDto {
    if (!blacklistWord) return null;
    
    return {
      id: blacklistWord.id,
      word: blacklistWord.word,
    };
  }

  /**
   * Converte uma lista de entidades BlacklistWord para uma lista de DTOs de saída GetAllBlacklistWordsOutputDto
   * @param blacklistWords Lista de entidades BlacklistWord a serem convertidas
   * @returns Lista de DTOs de saída GetAllBlacklistWordsOutputDto
   */
  public static toOutputDtoList(blacklistWords: BlacklistWord[]): GetAllBlacklistWordsOutputDto[] {
    if (!blacklistWords || !Array.isArray(blacklistWords)) return [];
    
    return blacklistWords.map(blacklistWord => this.toOutputDto(blacklistWord));
  }
}
