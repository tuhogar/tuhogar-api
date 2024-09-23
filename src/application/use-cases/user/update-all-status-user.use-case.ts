import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { GetAllByAccountIdUserUseCase } from './get-all-by-account-id-user.use-case';
import { UpdateStatusUserUseCase } from './update-status-user.use-case';

@Injectable()
export class UpdateAllStatusUserUseCase {
    constructor(
        private readonly getAllByAccountIdUserUseCase: GetAllByAccountIdUserUseCase,
        private readonly updateStatusUserUseCase: UpdateStatusUserUseCase,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, accountId: string, status: AccountStatus): Promise<void> {
        const users = await this.getAllByAccountIdUserUseCase.execute(accountId, status === AccountStatus.ACTIVE ? UserRole.ADMIN : undefined);

        users.forEach(async (a) => {
          const updateStatusUserDto: UpdateStatusUserDto = { status: status === AccountStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE }
          await this.updateStatusUserUseCase.execute(authenticatedUser, a.id, updateStatusUserDto);
        });
    }
}