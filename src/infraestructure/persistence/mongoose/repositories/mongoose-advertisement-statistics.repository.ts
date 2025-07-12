import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementStatistics as AdvertisementStatisticsMongoose } from "../entities/advertisement-statistics.entity";
import { IAdvertisementStatisticsRepository } from "src/application/interfaces/repositories/advertisement-statistics.repository.interface";
import { AdvertisementStatistics } from "src/domain/entities/advertisement-statistics";
import { MongooseAdvertisementStatisticsMapper } from "../mapper/mongoose-advertisement-statistics.mapper";

export class MongooseAdvertisementStatisticsRepository implements IAdvertisementStatisticsRepository {
    constructor(
        @InjectModel(AdvertisementStatisticsMongoose.name) 
        private readonly advertisementStatisticsModel: Model<AdvertisementStatisticsMongoose>,
    ) {}
    
    async create(statistics: AdvertisementStatistics): Promise<AdvertisementStatistics> {
        const data = MongooseAdvertisementStatisticsMapper.toMongoose(statistics);
        const entity = new this.advertisementStatisticsModel({ ...data });
        await entity.save();

        return MongooseAdvertisementStatisticsMapper.toDomain(entity);
    }
    
    async findByMonth(month: string): Promise<AdvertisementStatistics> {
        const query = await this.advertisementStatisticsModel
            .findOne({ month })
            .exec();
        
        return MongooseAdvertisementStatisticsMapper.toDomain(query);
    }
    
    async findAllMonths(): Promise<string[]> {
        const query = await this.advertisementStatisticsModel
            .find()
            .sort({ month: -1 })
            .limit(12)
            .select('month')
            .exec();
        
        return query.map(entity => entity.month);
    }
    
    async update(id: string, statistics: AdvertisementStatistics): Promise<AdvertisementStatistics> {
        const data = MongooseAdvertisementStatisticsMapper.toMongoose(statistics);
        
        const updated = await this.advertisementStatisticsModel
            .findByIdAndUpdate(id, data, { new: true })
            .exec();
        
        if (updated) {
            return MongooseAdvertisementStatisticsMapper.toDomain(updated);
        }
        
        return null;
    }
    
    /**
     * Busca o último registro de estatísticas acumuladas disponível
     * @returns O último registro de estatísticas acumuladas ou null se não existir
     */
    async findLastAccumulated(): Promise<AdvertisementStatistics | null> {
        const query = await this.advertisementStatisticsModel
            .findOne({
                // Garantir que apenas registros com métricas acumuladas sejam considerados
                accumulatedMetrics: { $exists: true, $ne: null }
            })
            .sort({ month: -1 }) // Ordenar por mês em ordem decrescente para pegar o mais recente
            .exec();
        
        return MongooseAdvertisementStatisticsMapper.toDomain(query);
    }
}
