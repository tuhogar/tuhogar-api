import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole } from 'src/domain/entities/user';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { DeleteAdvertisementsDto } from 'src/infraestructure/http/dtos/advertisement/delete-advertisements.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';

@Injectable()
export class DeleteAllAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly redisService: RedisService
    ) {}

    async execute(authenticatedUser: AuthenticatedUser, deleteAdvertisementsDto: DeleteAdvertisementsDto): Promise<void> {
        const advertisementIds = deleteAdvertisementsDto.advertisements.map((a) => a.id);
        
        const advertisements = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : undefined);

        await this.advertisementRepository.deleteMany(advertisementIds, authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : undefined);

        await Promise.all(advertisements.map((a) => this.algoliaService.delete(a.id)));
        await Promise.all(
            advertisements.map((a) => this.redisService.delete(a.id))
        );

        const photoUrls: string[] = [];
        advertisements.forEach((a) => {
            a.photos.forEach((b) => {
                photoUrls.push(b.url);
            })
        })

        if(!photoUrls.length) return;
        
        await Promise.all(photoUrls.map((url) => this.cloudinaryService.deleteImage(this.getPublicIdFromImageUrl(url))));
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}