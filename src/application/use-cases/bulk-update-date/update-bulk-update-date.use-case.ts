import { Injectable } from '@nestjs/common';
import { IBulkUpdateDateRepository } from 'src/application/interfaces/repositories/bulk-update-date.repository.interface';

@Injectable()
export class UpdateBulkUpdateDateUseCase {
    constructor(
        private readonly bulkUpdateDateRepository: IBulkUpdateDateRepository,
    ) {
    }

    async execute(updatedAt: Date): Promise<void> {
        await this.bulkUpdateDateRepository.findOneAndUpdate(updatedAt);
    }
}