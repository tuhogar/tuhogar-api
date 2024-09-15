import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason.interface';
import { CreateUpdateAdvertisementReasonDto } from 'src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto';

@Injectable()
export class GetAllAdvertisementReasonUseCase {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async execute(): Promise<AdvertisementReason[]> {
        return this.advertisementReasonRepository.find();
    }   
}