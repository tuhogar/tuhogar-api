import { Injectable } from '@nestjs/common';
import { IBulkUpdateDateRepository } from 'src/application/interfaces/repositories/bulk-update-date.repository.interface';
import { BulkUpdateDate } from 'src/domain/entities/bulk-update-date.interface';

@Injectable()
export class GetBulkUpdateDateUseCase {
    constructor(
        private readonly bulkUpdateDateRepository: IBulkUpdateDateRepository,
    ) {
    }

    async execute(): Promise<BulkUpdateDate> {
        return this.bulkUpdateDateRepository.findOne();
    }
}