import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IBulkUpdateDateRepository } from 'src/application/interfaces/repositories/bulk-update-date.repository.interface';
import { BulkUpdateDate } from 'src/domain/entities/bulk-update-date.interface';

@Injectable()
export class BulkUpdateDateService {
    constructor(
        private readonly bulkUpdateDateRepository: IBulkUpdateDateRepository,
    ) {
    }

    async update(updatedAt: Date): Promise<void> {
        await this.bulkUpdateDateRepository.update(updatedAt);
    }

    async get(): Promise<BulkUpdateDate> {
        return this.bulkUpdateDateRepository.get();
    }
}