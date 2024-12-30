import { ContractType } from 'src/domain/entities/contract-type';
import { ContractType as ContractTypeDocument } from '../entities/contract-type.entity';

export class MongooseContractTypeMapper {
    
    static toDomain(entity: ContractTypeDocument): ContractType {
        if (!entity) return null;
        
        const model = new ContractType({
            id: entity._id.toString(),
            key: entity.key,
            name: entity.name,
        });
        return model;
    }

    static toMongoose(contractType: ContractType) {
        return {
            key: contractType.key,
            name: contractType.name,
        }
    }
}