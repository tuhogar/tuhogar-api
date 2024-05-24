import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dtos/create-account.dto';
import { Account } from './interfaces/account.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlansService } from 'src/plans/plans.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UserRole, UserStatus } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AccountsService {

    private accounts: Account[] = [];

    constructor(
        @InjectModel('Account') private readonly accountModel: Model<Account>,
        private readonly plansService: PlansService,
        private readonly usersService: UsersService,
    ) {}

    async getAll(): Promise<Account[]> {
        return this.accountModel.find().populate('planId').exec();
    }

    async create(createAccountDto: CreateAccountDto): Promise<void> {

        const plan = await this.plansService.getById(createAccountDto.planId);
        if (!plan) throw new Error('Plan do not exist');

        const accountCreated = new this.accountModel(createAccountDto);
        await accountCreated.save();

        const createUserDto: CreateUserDto = {
            name: createAccountDto.name,
            email: createAccountDto.email,
            accountId: accountCreated._id.toString(),
            userRole: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
        }

        try {
            await this.usersService.create(createUserDto);
        } catch(error) {
            await this.accountModel.deleteOne({ _id: accountCreated._id.toString() });
            throw error;
        }
    }
}
