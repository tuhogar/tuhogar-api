import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BulkUpdateDate } from "src/domain/entities/bulk-update-date";
import { BulkUpdateDate as BulkUpdateDateMongoose } from "../entities/bulk-update-date.entity"
import { IBulkUpdateDateRepository } from "src/application/interfaces/repositories/bulk-update-date.repository.interface";
import { MongooseBulkUpdateDateMapper } from "../mapper/mongoose-bulk-update-date.mapper";

export class MongooseBulkUpdateDateRepository implements IBulkUpdateDateRepository {
    constructor(
        @InjectModel(BulkUpdateDateMongoose.name) private readonly bulkUpdateDateModel: Model<BulkUpdateDateMongoose>,
    ) {}
    
    async update(bulkUpdateDate: BulkUpdateDate): Promise<BulkUpdateDate> {
        const data = MongooseBulkUpdateDateMapper.toMongoose(bulkUpdateDate);

        const updated = await this.bulkUpdateDateModel.findOneAndUpdate(
            {},
            data,
            { new: true, upsert: true }
          ).exec();
        
        return MongooseBulkUpdateDateMapper.toDomain(updated);
    }
    
    async findOne(): Promise<BulkUpdateDate> {
        const query = await this.bulkUpdateDateModel.findOne().exec();

        return MongooseBulkUpdateDateMapper.toDomain(query);
    }
}