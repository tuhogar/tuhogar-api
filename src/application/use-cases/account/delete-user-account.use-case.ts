import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { DeleteUserUseCase } from '../user/delete-user.use-case';

@Injectable()
export class DeleteUserAccountUseCase {
  constructor(
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  async execute(authenticatedUser: AuthenticatedUser, userId: string): Promise<void> {
    await this.deleteUserUseCase.execute(authenticatedUser, userId);
  }
}
