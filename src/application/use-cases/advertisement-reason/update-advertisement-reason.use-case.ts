import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason.interface';
import { CreateUpdateAdvertisementReasonDto } from 'src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto';

@Injectable()
export class UpdateAdvertisementReasonUseCase {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async execute(
        advertisementReasonId: string,
        createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto,
    ): Promise<{ id: string }> {

        const updatedAdvertisementReason = await this.advertisementReasonRepository.update(advertisementReasonId, createUpdateAdvertisementReasonDto);

        if (!updatedAdvertisementReason) throw new Error('notfound.advertisement.do.not.exists');

        return { id: updatedAdvertisementReason.id };
    }
}