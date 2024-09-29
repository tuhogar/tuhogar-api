import { Injectable } from '@nestjs/common';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { UpdateStatusUserUseCase } from './update-status-user.use-case';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class UpdateAllStatusUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly updateStatusUserUseCase: UpdateStatusUserUseCase,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, accountId: string, status: AccountStatus): Promise<void> {

        const filter = { accountId, userRole: status === AccountStatus.ACTIVE ? UserRole.ADMIN : undefined };

        const users = await this.userRepository.find(filter);

        users.forEach(async (a) => {
          const updateStatusUserDto: UpdateStatusUserDto = { status: status === AccountStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE }
          await this.updateStatusUserUseCase.execute(authenticatedUser, a.id, updateStatusUserDto);
        });
    }
}