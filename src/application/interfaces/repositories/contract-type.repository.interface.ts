import { ContractType } from "src/domain/entities/contract-type";

export abstract class IContractTypeRepository {
    abstract find(): Promise<ContractType[]>
    abstract findOneById(id: string): Promise<ContractType>
}