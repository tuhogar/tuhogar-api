import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { Account } from 'src/domain/entities/account.interface';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

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
    ): Promise<void> {
        const userCreated = await this.userRepository.create(authenticatedUser, createUserDto, accountCreated);
        
        try {
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(authenticatedUser.uid, { 
                userRole: createUserDto.userRole,
                planId: accountCreated.planId,
                accountId: accountCreated.id,
                accountStatus: accountCreated.status,
                userStatus: userCreated.status,
                userId: userCreated._id.toString(),
            });
        } catch(error) {
            await this.userRepository.deleteOne({ _id: userCreated._id.toString() });
            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }

    }
}