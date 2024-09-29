import { Injectable } from '@nestjs/common';
import { IAdvertisementReasonRepository } from 'src/application/interfaces/repositories/advertisement-reason.repository.interface';

interface DeleteAdvertisementReasonUseCaseCommand {
    id: string,
}

@Injectable()
export class DeleteAdvertisementReasonUseCase {
    constructor(
        private readonly advertisementReasonRepository: IAdvertisementReasonRepository,
    ) {}

    async execute({ id }: DeleteAdvertisementReasonUseCaseCommand): Promise<void> {
        await this.advertisementReasonRepository.deleteOne(id);
    }   
}