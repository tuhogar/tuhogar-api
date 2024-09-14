import { Inject, Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account.interface';
import { User, UserRole } from 'src/domain/entities/user.interface';
import { UserService } from 'src/application/use-cases/user/user.service';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { CreateAccountDto } from 'src/infraestructure/http/dtos/account/create-account.dto';
import { CreateUserDto } from 'src/infraestructure/http/dtos/user/create-user.dto';
import { UpdateStatusAccountDto } from 'src/infraestructure/http/dtos/account/update-status-account.dto';
import { AdvertisementService } from 'src/application/use-cases/advertisement/advertisement.service';
import { Advertisement } from 'src/domain/entities/advertisement.interface';
import { UploadImageAccountDto } from 'src/infraestructure/http/dtos/account/upload-image-account.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { PatchAccountDto } from 'src/infraestructure/http/dtos/account/patch-account.dto';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly userService: UserService,
    private readonly advertisementService: AdvertisementService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getAll(): Promise<Account[]> {
    return this.accountRepository.getAll();
  }

  async getById(id: string): Promise<Account> {
    return this.accountRepository.getById(id);
  }

  async create(
    authenticatedUser: AuthenticatedUser,
    createAccountDto: CreateAccountDto,
  ): Promise<{ id: string }> {
    const accountCreated = await this.accountRepository.create(authenticatedUser, createAccountDto);

    try {
      const createUserDto = new CreateUserDto();
      createUserDto.name = createAccountDto.name;
      createUserDto.userRole = UserRole.ADMIN;

      await this.userService.create(
        authenticatedUser,
        createUserDto,
        accountCreated,
      );

    } catch (error) {
      await this.accountRepository.deleteOne(accountCreated.id);
      throw error;
    }

    return { id: accountCreated.id };
  }

  async patch(authenticatedUser: AuthenticatedUser, accountId: string, patchAccountDto: PatchAccountDto): Promise<void> {
    const filter = {
        _id: accountId,
        ...(authenticatedUser.userRole !== UserRole.MASTER && { _id: authenticatedUser.accountId })
    };

    const updatedAccount = await this.accountRepository.patch(filter, patchAccountDto);

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }

  async updateStatus(
    authenticatedUser: AuthenticatedUser,
    accountId: string,
    updateStatusAccountDto: UpdateStatusAccountDto,
  ): Promise<{ id: string }> {
    const filter = { _id: accountId };

    const updatingAccount = await this.accountRepository.findOneAndUpdateForUpdateStatus(filter, { 
      ...updateStatusAccountDto,
    });
    
    if (!updatingAccount) throw new Error('notfound.account.do.not.exists');

    try {
        await this.userService.updateAllStatus(authenticatedUser, accountId,  updateStatusAccountDto.status);
    } catch(error) {
        await this.accountRepository.findOneAndUpdateForUpdateStatus(
            filter,
            { 
                status: updatingAccount.status,
            },
        );

        throw error;
    }

    return { id: updatingAccount.id };
  }

  async getUsers(accountId: string): Promise<User[]> {
    return this.userService.getAllByAccountId(accountId);
  }

  async getAdvertisements(accountId: string): Promise<Advertisement[]> {
    return this.advertisementService.getAllByAccountId(accountId);
  }

  async deleteUser(authenticatedUser: AuthenticatedUser, userId: string): Promise<void> {
    await this.userService.delete(authenticatedUser, userId);
  }

  async processImage(authenticatedUser: AuthenticatedUser, uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
    const account = await this.accountRepository.getById(authenticatedUser.accountId);
    if (!account) throw new Error('notfound.account.do.not.exists');

    const imageName = authenticatedUser.accountId;

    let imageContent = uploadImageAccountDto.content;

    if (!uploadImageAccountDto.contentType.includes('webp')) {
      imageContent = await this.cloudinaryService.convertToWebP(imageContent);
    }

    const imageUrl = await this.cloudinaryService.uploadBase64Image(imageContent, 'image/webp', imageName, 'accounts');
    const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
   
    const updatedAccount = await this.accountRepository.findByIdAndUpdateForProcessImage(
        authenticatedUser.accountId, imageUrlStr);

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }

  async deleteImage(authenticatedUser: AuthenticatedUser): Promise<void> {
    const updatedAccount = await this.accountRepository.findByIdAndUpdateForDeleteImage(authenticatedUser.accountId);
    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');

    await this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(updatedAccount.photo));
  }

  async findInactiveAccounts(): Promise<Account[]> {
    return this.accountRepository.findInactiveAccounts();
  }

  async getAccountRegistrations(period: 'week' | 'month'): Promise<any[]> {
    return this.accountRepository.getAccountRegistrations(period);
  }

  private getPublicIdFromImageUrl(imageUrl: string): string {
    const split = imageUrl.split('/');
    return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
  }
}
