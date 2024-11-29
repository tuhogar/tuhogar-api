import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementEvent as AdvertisementEventMongoose } from "../entities/advertisement-event.entity"
import { IAdvertisementEventRepository } from "src/application/interfaces/repositories/advertisement-event.repository.interface";
import { AdvertisementEvent } from "src/domain/entities/advertisement-event";
import { MongooseAdvertisementEventMapper } from "../mapper/mongoose-advertisement-event.mapper";

export class MongooseAdvertisementEventRepository implements IAdvertisementEventRepository {
    constructor(
        @InjectModel(AdvertisementEventMongoose.name) private readonly advertisementEventModel: Model<AdvertisementEventMongoose>,
    ) {}
    
    async findOneByAdvertisementIdAndType(advertisementId: string, type: string): Promise<AdvertisementEvent> {
        const query = await this.advertisementEventModel.findOne({ advertisementId, type }).exec();
        return MongooseAdvertisementEventMapper.toDomain(query);
    }
    
    async create(advertisementEvent: AdvertisementEvent): Promise<AdvertisementEvent> {
        const data = MongooseAdvertisementEventMapper.toMongoose(advertisementEvent);
        const entity = new this.advertisementEventModel({ ...data });
        await entity.save();

        return MongooseAdvertisementEventMapper.toDomain(entity);
    }
    
    async update(id: string, count: number): Promise<AdvertisementEvent> {
        const updated = await this.advertisementEventModel.findOneAndUpdate(
            { _id: id },
            { count },
            { new: true }
        ).exec();
  
        if (updated) {
          return MongooseAdvertisementEventMapper.toDomain(updated);
        }
  
        return null;
    }
}