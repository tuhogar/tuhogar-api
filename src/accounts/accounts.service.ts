import { Injectable } from '@nestjs/common';
import { Account, AccountStatus } from './interfaces/account.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateAccountDto } from './dtos/create-account.dto';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UpdateStatusAccountDto } from './dtos/update-status-account.dto';
import { AdvertisementsService } from 'src/advertisements/advertisements.service';
import { Advertisement } from 'src/advertisements/interfaces/advertisement.interface';
import { UploadImageAccountDto } from './dtos/upload-image-account.dto';
import { ImageUploadService } from 'src/image-upload/image-upload.service';
import { PatchAccountDto } from './dtos/patch-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('Account') private readonly accountModel: Model<Account>,
    private readonly usersService: UsersService,
    private readonly advertisementsService: AdvertisementsService,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  async getAll(): Promise<Account[]> {
    return this.accountModel.find().populate('planId').exec();
  }

  async getById(id: string): Promise<Account> {
    return this.accountModel.findOne({ _id: id }).select('_id name description phone socialMedia webSite whatsApp address photo').exec();
  }

  async create(
    authenticatedUser: AuthenticatedUser,
    createAccountDto: CreateAccountDto,
  ): Promise<{ id: string }> {
    const accountCreated = new this.accountModel({
      planId: createAccountDto.planId,
      name: createAccountDto.name,
      email: authenticatedUser.email,
      phone: createAccountDto.phone,
      documentType: createAccountDto.documentType,
      documentNumber: createAccountDto.documentNumber,
      status: AccountStatus.ACTIVE,
    });
    await accountCreated.save();

    try {
      const createUserDto = new CreateUserDto();
      createUserDto.name = createAccountDto.name;
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

    return { id: accountCreated._id.toString() };
  }

  async patch(authenticatedUser: AuthenticatedUser, accountId: string, patchAccountDto: PatchAccountDto): Promise<void> {
    const filter = {
        _id: accountId,
        ...(authenticatedUser.userRole !== UserRole.MASTER && { _id: authenticatedUser.accountId })
    };

    const updatedAccount = await this.accountModel.findOneAndUpdate(filter,
        patchAccountDto,
        { new: true }
    ).exec();

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
}

  async updateStatus(
    authenticatedUser: AuthenticatedUser,
    accountId: string,
    updateStatusAccountDto: UpdateStatusAccountDto,
): Promise<{ id: string }> {
    const filter = { _id: accountId };
    
    const updatingAccount = await this.accountModel.findOneAndUpdate(
        filter,
        { 
            ...updateStatusAccountDto,
        },
    ).exec();

    if (!updatingAccount) throw new Error('notfound.account.do.not.exists');

    try {
        await this.usersService.updateAllStatus(authenticatedUser, accountId,  updateStatusAccountDto.status);
    } catch(error) {
        await this.accountModel.findOneAndUpdate(
            filter,
            { 
                status: updatingAccount.status,
            },
        ).exec();

        throw error;
    }

    return { id: updatingAccount._id.toString() };
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

    const imageName = authenticatedUser.accountId;

    const imageUrl = await this.imageUploadService.uploadBase64Image(uploadImageAccountDto.content, uploadImageAccountDto.contentType, imageName, 'accounts');
    const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
   
    const updatedAccount = await this.accountModel.findByIdAndUpdate(
        authenticatedUser.accountId,
        { photo: imageUrlStr },
        { new: true }
    ).exec();

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }

  async deleteImage(authenticatedUser: AuthenticatedUser): Promise<void> {
    const updatedAccount = await this.accountModel.findByIdAndUpdate(authenticatedUser.accountId,
        { $unset: { photo: '' } },
    ).exec();
    
    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');

    await this.imageUploadService.deleteImage(this.getPublicIdFromImageUrl(updatedAccount.photo));
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

  private getPublicIdFromImageUrl(imageUrl: string): string {
    const split = imageUrl.split('/');
    return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
  }
}
