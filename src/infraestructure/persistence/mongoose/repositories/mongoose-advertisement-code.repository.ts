import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementCode as AdvertisementCodeMongoose } from "../entities/advertisement-code.entity"
import { IAdvertisementCodeRepository } from "src/application/interfaces/repositories/advertisement-code.repository.interface";

export class MongooseAdvertisementCodeRepository implements IAdvertisementCodeRepository {
    constructor(
        @InjectModel(AdvertisementCodeMongoose.name) private readonly advertisementCodeModel: Model<AdvertisementCodeMongoose>,
    ) {}

    async generate(): Promise<number> {
        const result = await this.advertisementCodeModel.findOneAndUpdate(
            {},
            { $inc: { code: 1 } },
            { new: true, upsert: true }
          ).exec();
      
          return result.code;
    }
}