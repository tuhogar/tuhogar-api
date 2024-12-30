import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { Account } from 'src/domain/entities/account';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { Subscription } from 'src/domain/entities/subscription';
import { User, UserStatus } from 'src/domain/entities/user';

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(
        authenticatedUser: AuthenticatedUser,
        createUserDto: CreateUserDto,
        accountCreated: Account,
    ): Promise<User> {
        const user = new User({
            name: createUserDto.name,
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            userRole: createUserDto.userRole,
            status: UserStatus.ACTIVE,
            accountId: accountCreated.id,
        });
        const userCreated = await this.userRepository.create(user);
        return userCreated;
    }
}