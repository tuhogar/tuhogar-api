import { Injectable } from '@nestjs/common';
import { IAccountEventRepository } from 'src/application/interfaces/repositories/account-event.repository.interface';
import { AccountEvent } from 'src/domain/entities/account-event';

interface CreateAccountEventUseCaseCommand {
    accountId: string,
    type: string,
}

@Injectable()
export class CreateAccountEventUseCase {
    constructor(
        private readonly accountEventRepository: IAccountEventRepository,
    ) {}

    async execute(
        { accountId, type }: CreateAccountEventUseCaseCommand,
    ): Promise<AccountEvent> {
        const exists = await this.accountEventRepository.findOneByAccountIdAndType(accountId, type);
        if(exists) {
            return this.accountEventRepository.update(exists.id, exists.count + 1);
        }

        const accountEvent = new AccountEvent({
            accountId,
            type,
            count: 1
        })

        const response = await this.accountEventRepository.create(accountEvent);
        return response;
    }
}