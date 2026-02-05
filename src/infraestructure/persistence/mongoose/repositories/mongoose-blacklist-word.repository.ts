import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlacklistWord as BlacklistWordMongoose } from "../entities/blacklist-word.entity"
import { BlacklistWord } from "src/domain/entities/blacklist-word";
import { IBlacklistWordRepository } from "src/application/interfaces/repositories/blacklist-word.repository.interface";
import { MongooseBlacklistWordMapper } from "../mapper/mongoose-blacklist-word.mapper";

export class MongooseBlacklistWordRepository implements IBlacklistWordRepository {
    constructor(
        @InjectModel(BlacklistWordMongoose.name) private readonly blacklistWordModel: Model<BlacklistWordMongoose>,
    ) {
    }
    
    async findAll(): Promise<BlacklistWord[]> {
        const query = await this.blacklistWordModel.find({}).exec();
        return query.map((item) => MongooseBlacklistWordMapper.toDomain(item));
    }

    async create(blacklistWord: BlacklistWord): Promise<BlacklistWord> {
        const data = MongooseBlacklistWordMapper.toMongoose(blacklistWord);
        const entity = new this.blacklistWordModel({ ...data });
        await entity.save();

        return MongooseBlacklistWordMapper.toDomain(entity);
    }
}