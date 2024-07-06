import { Injectable } from '@nestjs/common';
import { Account, AccountStatus } from './interfaces/account.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, UserStatus } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateAccountDto } from './dtos/create-account.dto';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UpdateStatusAccountDto } from './dtos/update-status-account.dto';
import { UpdateStatusUserDto } from 'src/users/dtos/update-status-user.dto';
import { AdvertisementsService } from 'src/advertisements/advertisements.service';
import { Advertisement } from 'src/advertisements/interfaces/advertisement.interface';
import { UploadImageAccountDto } from './dtos/upload-image-account.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccountsService {
  private imagesUrl: string;
  private readonly uploadDir = path.join(__dirname, '..', '..', 'uploads');

  constructor(
    @InjectModel('Account') private readonly accountModel: Model<Account>,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly advertisementsService: AdvertisementsService,
  ) {
    this.imagesUrl = this.configService.get<string>('IMAGES_URL');

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
  }

  private updatePhotoUrls(accounts: Account[]): Account[] {
    return accounts.map(a => ({
        ...a.toObject(),
        photo: `${this.imagesUrl}/${a.photo}`,
        })) as Account[];
  }

  async getAll(): Promise<Account[]> {
    const accounts = await this.accountModel.find().populate('planId').exec();
    return this.updatePhotoUrls(accounts);
  }

  async getById(id: string): Promise<Account> {
    const account = await this.accountModel.findOne({ _id: id }).exec();
    
    const [updatedAccount] = this.updatePhotoUrls([account]);
    return updatedAccount;
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
        const users = await this.usersService.getAllByAccountId(accountId, updateStatusAccountDto.status === AccountStatus.ACTIVE ? UserRole.ADMIN : undefined);

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

  async processImage(authenticatedUser: AuthenticatedUser, uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
    const account = await this.accountModel.findById(authenticatedUser.accountId);
    if (!account) throw new Error('notfound.account.do.not.exists');

    const photo = account.photo;
    if (photo) {
      fs.unlink(`./uploads/${photo}`, () => {});
    }

    const fileName = uploadImageAccountDto.name.split('.');
    const extention = fileName[fileName.length-1];

    const randomId = uuidv4();
    const imageName = `${authenticatedUser.userId}-${randomId}.${extention}`;

    const originalFilePath = path.join(this.uploadDir, imageName);

    await sharp(Buffer.from(uploadImageAccountDto.content))
        .resize(352, 352)
        .toFile(originalFilePath);
   
    const updatedAccount = await this.accountModel.findByIdAndUpdate(
        authenticatedUser.accountId,
        { photo: imageName },
        { new: true }
    ).exec();

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }

  async deleteImage(authenticatedUser: AuthenticatedUser): Promise<void> {
    const updatedAccount = await this.accountModel.findByIdAndUpdate(authenticatedUser.accountId,
        { $unset: { photo: '' } },
    ).exec();
    
    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');

    fs.unlink(`./uploads/${updatedAccount.photo}`, () => {});
  }

  async findInactiveAccounts(): Promise<Account[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const accounts = await this.accountModel.aggregate([
      {
        $match: {
          createdAt: {
            $lt: twentyFourHoursAgo
          }
        }
      },
      {
        $lookup: {
          from: 'advertisements',
          localField: '_id',
          foreignField: 'accountId',
          as: 'advertisements'
        }
      },
      {
        $match: {
          'advertisements': { $size: 0 }
        }
      },
      {
        $project: {
          _id: 1,
          planId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]);

    return accounts;
  }

  async getAccountRegistrations(period: 'week' | 'month'): Promise<any[]> {
    let groupId: any;
    if (period === 'week') {
      groupId = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' },
      };
    } else {
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    }

    const accounts = await this.accountModel.aggregate([
      {
        $group: {
          _id: groupId,
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.week': 1,
          '_id.month': 1
        }
      }
    ]);

    return accounts;
  }
}
