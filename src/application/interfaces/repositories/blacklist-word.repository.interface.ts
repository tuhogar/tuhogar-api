import { BlacklistWord } from "src/domain/entities/blacklist-word";

export abstract class IBlacklistWordRepository {
    abstract findAll(): Promise<BlacklistWord[]>
    abstract create(blacklistWord: BlacklistWord): Promise<BlacklistWord>
}