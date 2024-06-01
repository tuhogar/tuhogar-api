import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { User, UserRole, UserStatus } from './interfaces/user.interface';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { ConfigService } from '@nestjs/config';
import { AccountStatus } from 'src/accounts/interfaces/account.interface';

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

    async create(name: string, email: string, planId: string, accountId: string, accountStatus: AccountStatus, userRole: UserRole, uid: string): Promise<void> {
        const userExists = await this.getByUid(uid);
        if (userExists) throw new Error('User already exists.');

        const userCreated = new this.userModel({ 
            name,
            email,
            accountId,
            userRole,
            uid,
            status: UserStatus.ACTIVE,
         });
        await userCreated.save();
        
        try {
            const app = this.admin.setup();
            await app.auth().setCustomUserClaims(uid, { 
                userRole,
                planId,
                accountId,
                accountStatus,
                userStatus: userCreated.status,
                userId: userCreated._id.toString(),
            });
        } catch(error) {
            await this.userModel.deleteOne({ _id: userCreated._id.toString() });
            throw new UnauthorizedException();
        }

    }

    async getByUid(uid: string): Promise<User> {
        return this.userModel.findOne({ uid });
    }

    async getAllByAccountId(accountId: string): Promise<User[]> {
        return this.userModel.find({ accountId }).exec();
    }

    async getById(uid: string): Promise<User> {
        return this.userModel.findOne({ uid }).exec();
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
            throw new UnauthorizedException('Invalid email or password');
          }
    }
}
