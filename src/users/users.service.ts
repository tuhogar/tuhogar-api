import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as fs from 'fs';
import { User, UserRole, UserStatus } from './interfaces/user.interface';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { ConfigService } from '@nestjs/config';
import { Account } from 'src/accounts/interfaces/account.interface';
import { PatchUserDto } from './dtos/patch-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UpdateStatusUserDto } from './dtos/update-status-user.dto';

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

    private updatePhotoUrls(users: User[]): User[] {
        return users.map(a => ({
            ...a.toObject(),
            photo: `${this.imagesUrl}/${a.photo}`,
            })) as User[];
    }

    async getAllByAccountId(accountId: string, userRole?: UserRole): Promise<User[]> {
        const filter = { accountId, ...(userRole && { userRole }) };
        
        const users = await this.userModel.find(filter).exec();
        return this.updatePhotoUrls(users);
    }

    async getByUid(uid: string): Promise<User> {
        const user = await this.userModel.findOne({ uid }).populate({ path: 'accountId' }).exec();
        if (!user) throw new Error('notfound.user.do.not.exists');

        const [updatedUser] = this.updatePhotoUrls([user]);
        return updatedUser;
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

    async deleteMe(uid: string): Promise<void> {
        await this.userModel.deleteOne({ uid }).exec();
    }

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

    async delete(authenticatedUser: AuthenticatedUser, userId: string): Promise<void> {

        const filter = {
            _id: userId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const deletedUser = await this.userModel.deleteOne(filter).exec();

        if (!deletedUser) throw new Error('notfound.user.do.not.exists');

        // TODO: remove user on firebase
    }

    async updloadImage(authenticatedUser: AuthenticatedUser, fileName: string, filePath: string): Promise<void> {
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ accountId: authenticatedUser.accountId, _id: authenticatedUser.userId },
                { photo: fileName },
                { new: true }
            ).exec();

            if (!updatedUser) throw new Error('notfound.user.do.not.exists');
        } catch(error) {
            fs.unlink(filePath, () => {});
            throw error;
        }
    }

    async deleteImage(authenticatedUser: AuthenticatedUser): Promise<void> {
        const updatedUser = await this.userModel.findOneAndUpdate({ accountId: authenticatedUser.accountId, _id: authenticatedUser.userId },
            { $unset: { photo: '' } },
        ).exec();
        
        if (!updatedUser) throw new Error('notfound.user.do.not.exists');

        fs.unlink(`./uploads/${updatedUser.photo}`, () => {});
    }
}
