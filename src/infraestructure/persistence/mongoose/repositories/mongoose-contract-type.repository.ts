import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractType as ContractTypeMongoose } from "../entities/contract-type.entity"
import { IContractTypeRepository } from "src/application/interfaces/repositories/contract-type.repository.interface";
import { ContractType } from "src/domain/entities/contract-type";
import { MongooseContractTypeMapper } from "../mapper/mongoose-contract-type.mapper";

export class MongooseContractTypeRepository implements IContractTypeRepository {
    constructor(
        @InjectModel(ContractTypeMongoose.name) private readonly contractTypeModel: Model<ContractTypeMongoose>,
    ) {}
    
    async find(): Promise<ContractType[]> {
        const query = await this.contractTypeModel.find().sort({ name: 1 }).exec();
        return query.map((item) => MongooseContractTypeMapper.toDomain(item));
    }

    async findOneById(id: string): Promise<ContractType> {
        const query = await this.contractTypeModel.findById(id).exec();
        return MongooseContractTypeMapper.toDomain(query);
    }
}