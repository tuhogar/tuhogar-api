import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { Account } from 'src/domain/entities/account';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { Subscription } from 'src/domain/entities/subscription';
import { User, UserRole, UserStatus } from 'src/domain/entities/user';

interface CreateUserUseCaseCommand {
    email: string;
    uid: string;
    name: string;
    userRole: UserRole;
    accountId: string;
}

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute({
        email,
        uid,
        name,
        userRole,
        accountId
    }: CreateUserUseCaseCommand): Promise<User> {
        const user = new User({
            name,
            email,
            uid,
            userRole,
            status: UserStatus.ACTIVE,
            accountId,
        });
        const userCreated = await this.userRepository.create(user);
        return userCreated;
    }
}