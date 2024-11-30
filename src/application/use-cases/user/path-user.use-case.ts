import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { User, UserRole, UserStatus } from 'src/domain/entities/user';
import { FirebaseAdmin } from 'src/infraestructure/config/firebase.config';
import { ConfigService } from '@nestjs/config';
import { Account, AccountStatus } from 'src/domain/entities/account';
import { PatchUserDto } from 'src/infraestructure/http/dtos/user/patch-user.dto';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { CreateUserMasterDto } from 'src/infraestructure/http/dtos/user/create-user-master.dto';
import { Advertisement } from 'src/domain/entities/advertisement';
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
        const user = await this.userRepository.findOneById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        if (authenticatedUser.userRole !== UserRole.MASTER && authenticatedUser.accountId !== user.accountId) {
            throw new Error('notfound.user.do.not.exists');
        }

        const updatedUser = await this.userRepository.update(userId, patchUserDto.name, patchUserDto.phone, patchUserDto.whatsApp);

        if (!updatedUser) throw new Error('notfound.user.do.not.exists');
    }
}