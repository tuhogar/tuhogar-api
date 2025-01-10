import { BulkUpdateDate } from 'src/domain/entities/bulk-update-date';
import { BulkUpdateDate as BulkUpdateDateDocument } from '../entities/bulk-update-date.entity';
import * as mongoose from 'mongoose';

export class MongooseBulkUpdateDateMapper {
    
    static toDomain(entity: BulkUpdateDateDocument): BulkUpdateDate {
        if (!entity) return null;
        
        const model = new BulkUpdateDate({
            id: entity._id.toString(),
            updatedAt: entity.updatedAt,
        });
        return model;
    }

    static toMongoose(bulkUpdateDate: BulkUpdateDate) {
        return {
            updatedAt: bulkUpdateDate.updatedAt,
        }
    }
}