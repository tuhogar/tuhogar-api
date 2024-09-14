import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BulkUpdateDate as BulkUpdateDateMongoose } from "../entities/bulk-update-date.entity"
import { IBulkUpdateDateRepository } from "src/application/interfaces/repositories/bulk-update-date.repository.interface";
import { BulkUpdateDate } from "src/domain/entities/bulk-update-date.interface";

export class MongooseBulkUpdateDateRepository implements IBulkUpdateDateRepository {
    constructor(
        @InjectModel(BulkUpdateDateMongoose.name) private readonly bulkUpdateDateModel: Model<BulkUpdateDateMongoose>,
    ) {}
    
    async update(updatedAt: Date): Promise<void> {
        await this.bulkUpdateDateModel.findOneAndUpdate(
            {},
            { updatedAt },
            { new: true, upsert: true }
          ).exec();
    }
    
    async get(): Promise<any> {
        return this.bulkUpdateDateModel.findOne().exec();
    }
}