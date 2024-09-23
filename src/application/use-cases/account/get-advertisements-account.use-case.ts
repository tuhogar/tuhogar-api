import { Injectable } from '@nestjs/common';
import { Advertisement } from 'src/domain/entities/advertisement';
import { GetAllByAccountIdAdvertisementUseCase } from '../advertisement/get-all-by-account-id-advertisement.use-case';

@Injectable()
export class GetAdvertisementsAccountUseCase {
  constructor(
    private readonly getAllByAccountIdAdvertisementUseCase: GetAllByAccountIdAdvertisementUseCase,
  ) {}

  async execute(accountId: string): Promise<Advertisement[]> {
    return this.getAllByAccountIdAdvertisementUseCase.execute(accountId);
  }
}
