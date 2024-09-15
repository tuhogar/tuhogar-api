import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { UploadImageAccountDto } from 'src/infraestructure/http/dtos/account/upload-image-account.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@Injectable()
export class ProcessImageAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(authenticatedUser: AuthenticatedUser, uploadImageAccountDto: UploadImageAccountDto): Promise<void> {
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
}
