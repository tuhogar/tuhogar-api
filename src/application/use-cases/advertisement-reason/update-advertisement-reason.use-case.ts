import { Injectable } from '@nestjs/common';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason';

interface UpdateAdvertisementReasonUseCaseCommand {
    name: string,
}

@Injectable()
export class UpdateAdvertisementReasonUseCase {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async execute(
        id: string,
        { name }: UpdateAdvertisementReasonUseCaseCommand,
    ): Promise<AdvertisementReason> {
        const advertisementReason = new AdvertisementReason({
            name,
        });

        const updated = await this.advertisementReasonRepository.findOneAndUpdate(id, advertisementReason);
        if (!updated) throw new Error('notfound.advertisement.do.not.exists');

        return updated;
    }
}