import { Injectable } from '@nestjs/common';
import { BlacklistWord } from 'src/domain/entities/blacklist-word';
import { IBlacklistWordRepository } from 'src/application/interfaces/repositories/blacklist-word.repository.interface';

@Injectable()
export class GetAllBlacklistWordUseCase {
    constructor(
        private readonly blacklistWordRepository: IBlacklistWordRepository,
    ) {}

    async execute(): Promise<BlacklistWord[]> {
        return this.blacklistWordRepository.findAll();
    }
}