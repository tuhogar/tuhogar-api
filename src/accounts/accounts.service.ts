import { Injectable } from '@nestjs/common';
import { Account, AccountStatus } from './interfaces/account.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateAccountDto } from './dtos/create-account.dto';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UpdateStatusAccountDto } from './dtos/update-status-account.dto';
import { UpdateStatusUserDto } from 'src/users/dtos/update-status-user.dto';
import { AdvertisementsService } from 'src/advertisements/advertisements.service';
import { Advertisement } from 'src/advertisements/interfaces/advertisement.interface';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('Account') private readonly accountModel: Model<Account>,
    private readonly usersService: UsersService,
    private readonly advertisementsService: AdvertisementsService,
  ) {}

  async getAll(): Promise<Account[]> {
    return this.accountModel.find().populate('planId').exec();
  }

  async getById(id: string): Promise<Account> {
    return this.accountModel.findOne({ _id: id }).exec();
  }

  async create(
    authenticatedUser: AuthenticatedUser,
    createAccountDto: CreateAccountDto,
  ): Promise<void> {
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
      await this.accountModel.deleteOne({ _id: accountCreated._id.toString() }).exec();
      throw error;
    }
  }

  async updateStatus(
    authenticatedUser: AuthenticatedUser,
    accountId: string,
    updateStatusAccountDto: UpdateStatusAccountDto,
): Promise<void> {
    const filter = { _id: accountId };
    
    const updatingAccount = await this.accountModel.findOneAndUpdate(
        filter,
        { 
            ...updateStatusAccountDto,
        },
    ).exec();

    if (!updatingAccount) throw new Error('notfound.account.do.not.exists');

    try {
        const users = await this.usersService.getAllByAccountId(accountId, UserRole.ADMIN);

        users.forEach(async (a) => {
          const updateStatusUserDto: UpdateStatusUserDto = { status: updateStatusAccountDto.status === AccountStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.INACTIVE }
          await this.usersService.updateStatus(authenticatedUser, a._id.toString(), updateStatusUserDto);
        });
    } catch(error) {
        await this.accountModel.findOneAndUpdate(
            filter,
            { 
                status: updatingAccount.status,
            },
        ).exec();

        throw error;
    }
  }

  async getUsers(accountId: string): Promise<User[]> {
    return this.usersService.getAllByAccountId(accountId);
  }

  async getAdvertisements(accountId: string): Promise<Advertisement[]> {
    return this.advertisementsService.getAllByAccountId(accountId);
  }

  async deleteUser(authenticatedUser: AuthenticatedUser, userId: string): Promise<void> {
    await this.usersService.delete(authenticatedUser, userId);
  }
}
