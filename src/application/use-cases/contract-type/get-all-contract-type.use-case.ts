import { Injectable } from '@nestjs/common';
import { IContractTypeRepository } from 'src/application/interfaces/repositories/contract-type.repository.interface';
import { ContractType } from 'src/domain/entities/contract-type';

@Injectable()
export class GetAllContractTypeUseCase {
    constructor(
        private readonly contractTypeRepository: IContractTypeRepository,
    ) {}

    async execute(): Promise<ContractType[]> {
        return this.contractTypeRepository.find();
    }
}