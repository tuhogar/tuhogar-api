import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason.interface';
import { CreateUpdateAdvertisementReasonDto } from 'src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto';

@Injectable()
export class AdvertisementReasonService {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async getAll(): Promise<AdvertisementReason[]> {
        return this.advertisementReasonRepository.getAll();
    }

    async create(createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void> {
        await this.advertisementReasonRepository.create(createUpdateAdvertisementReasonDto);
    }

    async delete(advertisementReasonId: string): Promise<void> {
        await this.advertisementReasonRepository.delete(advertisementReasonId);
    }

    async update(
        advertisementReasonId: string,
        createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto,
    ): Promise<{ id: string }> {

        const updatedAdvertisementReason = await this.advertisementReasonRepository.update(advertisementReasonId, createUpdateAdvertisementReasonDto);

        if (!updatedAdvertisementReason) throw new Error('notfound.advertisement.do.not.exists');

        return { id: updatedAdvertisementReason.id };
    }
    
}