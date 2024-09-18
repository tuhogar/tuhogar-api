import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementCode as AdvertisementCodeMongoose } from "../entities/advertisement-code.entity"
import { IAdvertisementCodeRepository } from "src/application/interfaces/repositories/advertisement-code.repository.interface";
import { MongooseAdvertisementCodeMapper } from "../mapper/mongoose-advertisement-code.mapper";
import { AdvertisementCode } from "src/domain/entities/advertisement-code";

export class MongooseAdvertisementCodeRepository implements IAdvertisementCodeRepository {
    constructor(
        @InjectModel(AdvertisementCodeMongoose.name) private readonly advertisementCodeModel: Model<AdvertisementCodeMongoose>,
    ) {}

    async findOneAndUpdate(): Promise<AdvertisementCode> {
        const updated = await this.advertisementCodeModel.findOneAndUpdate(
            {},
            { $inc: { code: 1 } },
            { new: true, upsert: true }
          ).exec();
      
        return MongooseAdvertisementCodeMapper.toDomain(updated);
    }
}