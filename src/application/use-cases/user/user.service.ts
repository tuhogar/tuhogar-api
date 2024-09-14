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
export class UserService {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly admin: FirebaseAdmin,
        private readonly userRepository: IUserRepository,
    ) {
        this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY');
    }

    async create(
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

    /*
    async createMaster(
        authenticatedUser: AuthenticatedUser,
        createUserMasterDto: CreateUserMasterDto,
    ): Promise<void> {
        const userCreated = new this.userModel({
            ...createUserMasterDto,
            userRole: UserRole.MASTER,
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            status: UserStatus.ACTIVE,
         });
        await userCreated.save();
        
        try {
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(authenticatedUser.uid, { 
                userRole: UserRole.MASTER,
                userStatus: userCreated.status,
                userId: userCreated._id.toString(),
            });
        } catch(error) {
            await this.userModel.deleteOne({ _id: userCreated._id.toString() }).exec();
            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }
    }
    */
   
    async getAllByAccountId(accountId: string, userRole?: UserRole): Promise<User[]> {
        const filter = { accountId, ...(userRole && { userRole }) };
        
        return this.userRepository.find(filter);
    }

    async getByUid(uid: string): Promise<User> {
        const user = await this.userRepository.findOne({ uid });
        if (!user) throw new Error('notfound.user.do.not.exists');

        return user;
    }

    async login(email: string, password: string) {
        try {
          const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.firebaseApiKey}`,
            {
              email,
              password,
              returnSecureToken: true,
            },
          );
    
          return response.data;
        } catch (error) {
            throw new UnauthorizedException('authorization.invalid.email.or.password');
          }
    }

    /*
    async deleteMe(uid: string): Promise<void> {
        await this.userModel.deleteOne({ uid }).exec();
    }
    */

    async patch(authenticatedUser: AuthenticatedUser, userId: string, patchUserDto: PatchUserDto): Promise<void> {
        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const updatedUser = await this.userRepository.patch(filter, patchUserDto);

        if (!updatedUser) throw new Error('notfound.user.do.not.exists');
    }

    async updateStatus(
        authenticatedUser: AuthenticatedUser,
        userId: string,
        updateStatusUserDto: UpdateStatusUserDto,
    ): Promise<void> {

        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const updatingUser = await this.userRepository.findOneAndUpdate(filter, { ...updateStatusUserDto });

        if (!updatingUser) throw new Error('notfound.user.do.not.exists');

        const updatingPopulatedUser = await updatingUser.populate({ path: 'accountId' }) as any;

        try {
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(updatingUser.uid, { 
                userRole: updatingUser.userRole,
                planId: updatingPopulatedUser.accountId.planId.toString(),
                accountId: updatingPopulatedUser.accountId._id.toString(),
                accountStatus: updatingPopulatedUser.accountId.status,
                userStatus: updateStatusUserDto.status,
                userId: updatingUser._id.toString(),
                
            });
        } catch(error) {
            await this.userRepository.findOneAndUpdate(filter, { status: updatingUser.status });

            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }
    }

    async updateAllStatus(authenticatedUser: AuthenticatedUser, accountId: string, status: AccountStatus): Promise<void> {
        const users = await this.getAllByAccountId(accountId, status === AccountStatus.ACTIVE ? UserRole.ADMIN : undefined);

        users.forEach(async (a) => {
          const updateStatusUserDto: UpdateStatusUserDto = { status: status === AccountStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE }
          await this.updateStatus(authenticatedUser, a._id.toString(), updateStatusUserDto);
        });
    }

    async delete(authenticatedUser: AuthenticatedUser, userId: string): Promise<void> {

        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const user = await this.userRepository.findOne(filter);
        if (!user) throw new Error('notfound.user.do.not.exists');

        await this.userRepository.deleteOne(filter);

        try {
            const app = this.admin.setup();
            await app.auth().deleteUser(user.uid);
        } catch(error) {
            throw new UnauthorizedException('authorization.error.deleting.user.data.on.the.authentication.server');
        }
    }

    async createFavorite(userId: string, advertisementId: string): Promise<void> {
        const user = await this.userRepository.findByIdAndUpdate(userId, { $addToSet: { advertisementFavorites: advertisementId } });
      
          if (!user) throw new Error('notfound.user.do.not.exists');
    }

    async getFavorites(userId: string): Promise<Advertisement[]> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error('notfound.user.do.not.exists');

        return user.advertisementFavorites as Advertisement[];
    }

    async deleteFavorite(userId: string, advertisementId: string): Promise<void> {
        const user = await this.userRepository.findByIdAndUpdate(userId, { $pull: { advertisementFavorites: advertisementId } });
    
        if (!user) {
            if (!user) throw new Error('notfound.user.do.not.exists');
        }
      }
}