import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AccountAdvertisementStatistics as AccountAdvertisementStatisticsMongoose } from "../entities/account-advertisement-statistics.entity";
import { IAccountAdvertisementStatisticsRepository } from "src/application/interfaces/repositories/account-advertisement-statistics.repository.interface";
import { AccountAdvertisementStatistics } from "src/domain/entities/account-advertisement-statistics";
import { MongooseAccountAdvertisementStatisticsMapper } from "../mapper/mongoose-account-advertisement-statistics.mapper";

export class MongooseAccountAdvertisementStatisticsRepository implements IAccountAdvertisementStatisticsRepository {
    constructor(
        @InjectModel(AccountAdvertisementStatisticsMongoose.name) 
        private readonly accountAdvertisementStatisticsModel: Model<AccountAdvertisementStatisticsMongoose>,
    ) {}
    
    async create(statistics: AccountAdvertisementStatistics): Promise<AccountAdvertisementStatistics> {
        const data = MongooseAccountAdvertisementStatisticsMapper.toMongoose(statistics);
        const entity = new this.accountAdvertisementStatisticsModel({ ...data });
        await entity.save();

        return MongooseAccountAdvertisementStatisticsMapper.toDomain(entity);
    }
    
    async findByAccountIdAndMonth(accountId: string, month: string): Promise<AccountAdvertisementStatistics> {
        const query = await this.accountAdvertisementStatisticsModel
            .findOne({ accountId, month })
            .exec();
        
        return MongooseAccountAdvertisementStatisticsMapper.toDomain(query);
    }
    
    async findAllByAccountId(accountId: string): Promise<AccountAdvertisementStatistics[]> {
        const query = await this.accountAdvertisementStatisticsModel
            .find({ accountId })
            .sort({ month: -1 })
            .exec();
        
        return query.map(entity => MongooseAccountAdvertisementStatisticsMapper.toDomain(entity));
    }
    
    async update(id: string, statistics: Partial<AccountAdvertisementStatistics>): Promise<AccountAdvertisementStatistics> {
        const data = MongooseAccountAdvertisementStatisticsMapper.toMongoose(statistics as AccountAdvertisementStatistics);
        
        const updated = await this.accountAdvertisementStatisticsModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
        
        if (updated) {
            return MongooseAccountAdvertisementStatisticsMapper.toDomain(updated);
        }
        
        return null;
    }
}
