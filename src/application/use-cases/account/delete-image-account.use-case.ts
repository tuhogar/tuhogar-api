import { Injectable } from '@nestjs/common';
import { Account } from 'src/domain/entities/account';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@Injectable()
export class DeleteImageAccountUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(authenticatedUser: AuthenticatedUser): Promise<void> {
    const updatedAccount = await this.accountRepository.deleteImage(authenticatedUser.accountId);
    if (!updatedAccount) throw new Error('notfound.account.do.not.exists');

    await this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(updatedAccount.photo));
  }

  private getPublicIdFromImageUrl(imageUrl: string): string {
    const split = imageUrl.split('/');
    return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
  }
}
