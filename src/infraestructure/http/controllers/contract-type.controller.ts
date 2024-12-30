import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContractType } from 'src/domain/entities/contract-type';
import { GetAllContractTypeUseCase } from 'src/application/use-cases/contract-type/get-all-contract-type.use-case';

@ApiTags('v1/contract-types')
@Controller('v1/contract-types')
export class ContractTypeController {
    constructor(
        private readonly getAllContractTypeUseCase: GetAllContractTypeUseCase,
    ) {}

    @ApiBearerAuth()
    @Get()
    async getAll(): Promise<ContractType[]> {
        const response = await this.getAllContractTypeUseCase.execute();
        return response;
    }
}