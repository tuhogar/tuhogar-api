import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user.interface';
import { GetAllByAccountIdUserUseCase } from '../user/get-all-by-account-id-user.use-case';

@Injectable()
export class GetUsersAccountUseCase {
  constructor(
    private readonly getAllByAccountIdUserUseCase: GetAllByAccountIdUserUseCase,
  ) {}

  async execute(accountId: string): Promise<User[]> {
    return this.getAllByAccountIdUserUseCase.execute(accountId);
  }
}
