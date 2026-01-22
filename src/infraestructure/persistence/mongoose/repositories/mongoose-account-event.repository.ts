import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AccountEvent as AccountEventMongoose } from "../entities/account-event.entity"
import { IAccountEventRepository } from "src/application/interfaces/repositories/account-event.repository.interface";
import { AccountEvent } from "src/domain/entities/account-event";
import { MongooseAccountEventMapper } from "../mapper/mongoose-account-event.mapper";

export class MongooseAccountEventRepository implements IAccountEventRepository {
    constructor(
        @InjectModel(AccountEventMongoose.name) private readonly accountEventModel: Model<AccountEventMongoose>,
    ) {}
    
    async findOneByAccountIdAndType(accountId: string, type: string): Promise<AccountEvent> {
        const query = await this.accountEventModel.findOne({ accountId, type }).exec();
        return MongooseAccountEventMapper.toDomain(query);
    }
    
    async create(accountEvent: AccountEvent): Promise<AccountEvent> {
        const data = MongooseAccountEventMapper.toMongoose(accountEvent);
        const entity = new this.accountEventModel({ ...data });
        await entity.save();

        return MongooseAccountEventMapper.toDomain(entity);
    }
    
    async update(id: string, count: number): Promise<AccountEvent> {
        const updated = await this.accountEventModel.findOneAndUpdate(
            { _id: id },
            { count },
            { new: true }
        ).exec();
  
        if (updated) {
          return MongooseAccountEventMapper.toDomain(updated);
        }
  
        return null;
    }
}