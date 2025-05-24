import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/domain/entities/user';
import { DeleteUserUseCase } from '../user/delete-user.use-case';

interface DeleteUserAccountUseCaseCommand {
  userRole: UserRole;
  accountId: string;
  userId: string;
}

@Injectable()
export class DeleteUserAccountUseCase {
  constructor(
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  async execute({
    userRole,
    accountId,
    userId
  }: DeleteUserAccountUseCaseCommand): Promise<void> {
    await this.deleteUserUseCase.execute({
      userRole,
      accountId,
      userId
    });
  }
}
