import { ContractType } from "src/domain/entities/contract-type";

export abstract class IContractTypeRepository {
    abstract find(): Promise<ContractType[]>
    abstract findById(id: string): Promise<ContractType>
}