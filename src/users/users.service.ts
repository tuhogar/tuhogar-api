import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { User, UserStatus } from './interfaces/user.interface';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { ConfigService } from '@nestjs/config';
import { Account } from 'src/accounts/interfaces/account.interface';
import { PatchUserDto } from './dtos/patch-user.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class UsersService {
    private firebaseApiKey: string;

    constructor(
        private configService: ConfigService,
        private readonly admin: FirebaseAdmin,
        @InjectModel('User') private readonly userModel: Model<User>,
    ) {
        this.firebaseApiKey = this.configService.get<string>('FIREBASE_API_KEY');
    }

    async create(
        authenticatedUser: AuthenticatedUser,
        createUserDto: CreateUserDto,
        accountCreated: Account,
    ): Promise<void> {
        const userExists = await this.getByUid(authenticatedUser.uid);
        if (userExists) throw new Error('invalid.user.already.exists');

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
            await this.userModel.deleteOne({ _id: userCreated._id.toString() });
            throw new UnauthorizedException('authorization.error.updating.user.data.on.the.authentication.server');
        }

    }

    async getAllByAccountId(accountId: string): Promise<User[]> {
        return this.userModel.find({ accountId }).exec();
    }

    async getByUid(uid: string): Promise<User> {
        const user = await this.userModel.findOne({ uid }).exec();
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

    async delete(uid: string): Promise<void> {
        await this.userModel.deleteOne({ uid }).exec();
    }

    async patch(accountId: string, userId: string, patchUserDto: PatchUserDto): Promise<void> {
        const updatedUser = await this.userModel.findOneAndUpdate({ accountId, _id: userId },
            patchUserDto,
            { new: true }
        ).exec();

        if (!updatedUser) throw new Error('notfound.user.do.not.exists');
    }
}
