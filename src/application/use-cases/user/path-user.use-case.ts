import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { User, UserRole, UserStatus } from 'src/domain/entities/user.interface';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { ConfigService } from '@nestjs/config';
import { Account, AccountStatus } from 'src/domain/entities/account.interface';
import { PatchUserDto } from 'src/infraestructure/http/dtos/user/patch-user.dto';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { CreateUserMasterDto } from 'src/infraestructure/http/dtos/user/create-user-master.dto';
import { Advertisement } from 'src/domain/entities/advertisement.interface';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';

@Injectable()
export class PathUserUseCase {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {
        this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY');
    }

    async execute(authenticatedUser: AuthenticatedUser, userId: string, patchUserDto: PatchUserDto): Promise<void> {
        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const updatedUser = await this.userRepository.findOneAndUpdate(filter, patchUserDto, true);

        if (!updatedUser) throw new Error('notfound.user.do.not.exists');
    }
}