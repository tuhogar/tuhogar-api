import { Injectable } from '@nestjs/common';
import { IBulkUpdateDateRepository } from 'src/application/interfaces/repositories/bulk-update-date.repository.interface';
import { BulkUpdateDate } from 'src/domain/entities/bulk-update-date';

interface UpdateBulkUpdateDateUseCaseCommand {
    updatedAt: Date,
}

@Injectable()
export class UpdateBulkUpdateDateUseCase {
    constructor(
        private readonly bulkUpdateDateRepository: IBulkUpdateDateRepository,
    ) {
    }

    async execute({ updatedAt }: UpdateBulkUpdateDateUseCaseCommand): Promise<BulkUpdateDate> {

        const bulkUpdateDate = new BulkUpdateDate({ updatedAt });

        const response = await this.bulkUpdateDateRepository.findOneAndUpdate(bulkUpdateDate);
        return response;
    }
}