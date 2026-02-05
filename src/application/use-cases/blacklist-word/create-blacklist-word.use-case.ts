import { Injectable } from '@nestjs/common';
import { IBlacklistWordRepository } from 'src/application/interfaces/repositories/blacklist-word.repository.interface';
import { BlacklistWord } from 'src/domain/entities/blacklist-word';

interface CreateBlacklistWordUseCaseCommand {
    word: string,
}

@Injectable()
export class CreateBlacklistWordUseCase {

    constructor(
        private readonly blacklistWordRepository: IBlacklistWordRepository,
    ) {}

    async execute({
        word,
    }: CreateBlacklistWordUseCaseCommand): Promise<BlacklistWord> {
        const blacklistWord = new BlacklistWord({
            word,
        })

        const response = await this.blacklistWordRepository.create(blacklistWord);
        return response;
    }
}