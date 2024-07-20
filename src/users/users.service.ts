import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as fs from 'fs';
import { User, UserRole, UserStatus } from './interfaces/user.interface';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { ConfigService } from '@nestjs/config';
import { Account, AccountStatus } from 'src/accounts/interfaces/account.interface';
import { PatchUserDto } from './dtos/patch-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UpdateStatusUserDto } from './dtos/update-status-user.dto';
import { CreateUserMasterDto } from './dtos/create-user-master.dto';

@Injectable()
export class UsersService {
    private imagesUrl: string;
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly admin: FirebaseAdmin,
        @InjectModel('User') private readonly userModel: Model<User>,
    ) {
        this.imagesUrl = this.configService.get<string>('IMAGES_URL');
        this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY');
    }

    async create(
        authenticatedUser: AuthenticatedUser,
        createUserDto: CreateUserDto,
        accountCreated: Account,
    ): Promise<void> {
        const userCreated = new this.userModel({
            ...createUserDto,
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            status: UserStatus.ACTIVE,
            accountId: accountCreated._id.toString(),
         });
        await userCreated.save();
        
        try {
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(authenticatedUser.uid, { 
                userRole: createUserDto.userRole,
                planId: accountCreated.planId,
                accountId: accountCreated._id.toString(),
                accountStatus: accountCreated.status,
                userStatus: userCreated.status,
                userId: userCreated._id.toString(),
            });
        } catch(error) {
            await this.userModel.deleteOne({ _id: userCreated._id.toString() }).exec();
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
        
        return this.userModel.find(filter).exec();
    }

    async getByUid(uid: string): Promise<User> {
        const user = await this.userModel.findOne({ uid }).populate('accountId').exec();
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

        const updatedUser = await this.userModel.findOneAndUpdate(filter,
            patchUserDto,
            { new: true }
        ).exec();

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

        const updatingUser = await this.userModel.findOneAndUpdate(
            filter,
            { 
                ...updateStatusUserDto,
            },
        ).exec();

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
            await this.userModel.findOneAndUpdate(
                filter,
                { 
                    status: updatingUser.status,
                },
            ).exec();

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

        const user = await this.userModel.findOne(filter).exec();
        if (!user) throw new Error('notfound.user.do.not.exists');

        await this.userModel.deleteOne(filter).exec();

        try {
            const app = this.admin.setup();
            await app.auth().deleteUser(user.uid);
        } catch(error) {
            throw new UnauthorizedException('authorization.error.deleting.user.data.on.the.authentication.server');
        }
    }
}
