import { BlacklistWord } from 'src/domain/entities/blacklist-word';
import { BlacklistWord as BlacklistWordDocument } from '../entities/blacklist-word.entity';

export class MongooseBlacklistWordMapper {
    
    static toDomain(entity: BlacklistWordDocument): BlacklistWord {
        if (!entity) return null;
        
        const model = new BlacklistWord({
            id: entity._id.toString(),
            word: entity.word,
        });
        return model;
    }

    static toMongoose(blacklistWord: BlacklistWord) {
        return {
            word: blacklistWord.word,
        }
    }
}