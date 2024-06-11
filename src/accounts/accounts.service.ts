import { Injectable } from '@nestjs/common';
import { Account, AccountStatus } from './interfaces/account.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlansService } from 'src/plans/plans.service';
import { UserRole } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateAccountDto } from './dtos/create-account.dto';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('Account') private readonly accountModel: Model<Account>,
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
  ) {}

  async getAll(): Promise<Account[]> {
    return this.accountModel.find().populate('planId').exec();
  }

  async getById(id: string): Promise<Account> {
    return this.accountModel.findOne({ _id: id });
  }

  async create(
    authenticatedUser: AuthenticatedUser,
    createAccountDto: CreateAccountDto,
  ): Promise<void> {
    const plan = await this.plansService.getById(createAccountDto.planId);
    if (!plan) throw new Error('invalid.do.not.exists.plan');

    const accountCreated = new this.accountModel({
      planId: createAccountDto.planId,
      status: AccountStatus.ACTIVE,
    });
    await accountCreated.save();

    try {
      const createUserDto = new CreateUserDto();
      createUserDto.name = createAccountDto.name;
      createUserDto.phone = createAccountDto.phone;
      createUserDto.documentType = createAccountDto.documentType;
      createUserDto.documentNumber = createAccountDto.documentNumber;
      createUserDto.userRole = UserRole.ADMIN;

      await this.usersService.create(
        authenticatedUser,
        createUserDto,
        accountCreated,
      );
    } catch (error) {
      await this.accountModel.deleteOne({ _id: accountCreated._id.toString() });
      throw error;
    }
  }
}
