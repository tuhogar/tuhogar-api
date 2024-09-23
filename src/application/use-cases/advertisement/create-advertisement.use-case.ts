import { Injectable } from '@nestjs/common';
import { AdvertisementStatus } from 'src/domain/entities/advertisement';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { plainToClass } from 'class-transformer';
import { AddressDto } from 'src/infraestructure/http/dtos/address/address.dto';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { GenerateAdvertisementCodeUseCase } from '../advertisement-code/generate-advertisement-code.use-case';

@Injectable()
export class CreateAdvertisementUseCase {
    constructor(
        private readonly generateAdvertisementCodeuseCase: GenerateAdvertisementCodeUseCase,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(
        authenticatedUser: AuthenticatedUser,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {
        createUpdateAdvertisementDto.address = plainToClass(AddressDto, createUpdateAdvertisementDto.address);

        const advertisementCode = await this.generateAdvertisementCodeuseCase.execute();
        
        const advertisementCreated = await this.advertisementRepository.create({
            accountId: authenticatedUser.accountId, 
            createdUserId: authenticatedUser.userId, 
            updatedUserId: authenticatedUser.userId, 
            status: AdvertisementStatus.WAITING_FOR_APPROVAL,
            code: advertisementCode.code,
            ...createUpdateAdvertisementDto,
        });

        return { id: advertisementCreated.id };
    }
}