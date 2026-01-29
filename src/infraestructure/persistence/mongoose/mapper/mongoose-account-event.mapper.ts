import { AccountEvent } from 'src/domain/entities/account-event';
import { AccountEvent as AccountEventDocument } from '../entities/account-event.entity';

export class MongooseAccountEventMapper {
    
    static toDomain(entity: AccountEventDocument): AccountEvent {
        if (!entity) return null;
        
        const model = new AccountEvent({
            id: entity._id.toString(),
            accountId: entity.accountId?.toString(),
            type: entity.type?.toString(),
            count: entity.count,
        });
        return model;
    }

    static toMongoose(accountEvent: AccountEvent) {
        return {
            accountId: accountEvent.accountId,
            type: accountEvent.type,
            count: accountEvent.count
        }
    }
}