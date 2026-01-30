import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface DeleteImageAccountUseCaseCommand {
  accountId: string;
}

@Injectable()
export class DeleteImageAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute({
    accountId
  }: DeleteImageAccountUseCaseCommand): Promise<void> {
    const account = await this.accountRepository.findOneById(accountId);
    if (!account) throw new Error('notfound.account.do.not.exists');

    const updatedAccount = await this.accountRepository.deleteImage(accountId);
    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');

    await this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(account.photo));
  }

  private getPublicIdFromImageUrl(imageUrl: string): string {
    const split = imageUrl.split('/');
    return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
  }
}
