import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ConfigService } from '@nestjs/config';

interface ProcessImageAccountUseCaseCommand {
  accountId: string;
  content: string;
  contentType: string;
}

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

  async execute({
    accountId,
    content,
    contentType
  }: ProcessImageAccountUseCaseCommand): Promise<void> {
    const account = await this.accountRepository.findOneById(accountId);
    if (!account) throw new Error('notfound.account.do.not.exists');

    const imageName = accountId;

    let imageContent = content;

    if (!contentType.includes('webp')) {
      imageContent = await this.cloudinaryService.convertToWebP(imageContent);
    }

    const imageUrl = await this.cloudinaryService.uploadBase64Image(imageContent, 'image/webp', imageName, `accounts${this.cloudinaryFolders}`);
    const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
   
    const updatedAccount = await this.accountRepository.updateImage(accountId, imageUrlStr);

    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');
  }
}
