import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UploadImageAccountDto } from 'src/infraestructure/http/dtos/account/upload-image-account.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProcessImageAccountUseCase {
  private readonly cloudinaryFolders: string;
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {
    this.cloudinaryFolders = this.configService.get<string>('ENVIRONMENT') === 'PRODUCTION' ? '_prod' : '';
  }

  async execute(authenticatedUser: AuthenticatedUser, uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
    const account = await this.accountRepository.findOneById(authenticatedUser.accountId);
    if (!account) throw new Error('notfound.account.do.not.exists');

    const imageName = authenticatedUser.accountId;

    let imageContent = uploadImageAccountDto.content;

    if (!uploadImageAccountDto.contentType.includes('webp')) {
      imageContent = await this.cloudinaryService.convertToWebP(imageContent);
    }

    const imageUrl = await this.cloudinaryService.uploadBase64Image(imageContent, 'image/webp', imageName, `accounts${this.cloudinaryFolders}`);
    const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
   
    const updatedAccount = await this.accountRepository.updateImage(authenticatedUser.accountId, imageUrlStr);

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }
}
