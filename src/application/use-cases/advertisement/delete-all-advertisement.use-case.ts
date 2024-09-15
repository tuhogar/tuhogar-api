import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { UserRole } from 'src/domain/entities/user.interface';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { DeleteAdvertisementsDto } from 'src/infraestructure/http/dtos/advertisement/delete-advertisements.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class DeleteAllAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, deleteAdvertisementsDto: DeleteAdvertisementsDto): Promise<void> {
        const advertisementIds = deleteAdvertisementsDto.advertisements.map((a) => a.id);

        const filter = {
            _id: { $in: advertisementIds },
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const advertisements = await this.advertisementRepository.find(filter);

        await this.advertisementRepository.deleteMany(filter);

        advertisements.forEach(async (a) => await this.algoliaService.delete(a._id.toString()));

        const photoUrls: string[] = [];
        advertisements.forEach((a) => {
            a.photos.forEach((b) => {
                photoUrls.push(b.url);
            })
        })

        if(!photoUrls.length) return;
        
        photoUrls.forEach(async (a) => {
            await this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(a));
        });
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}