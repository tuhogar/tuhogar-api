import { SocialMedia } from 'src/domain/entities/social-media';

export class MongooseSocialMediaMapper {
    
    static toDomain(entity: any): SocialMedia {
        if (!entity) return null;
        
        const model = new SocialMedia({
            youtube: entity.youtube,
            tiktok: entity.tiktok,
            instagram: entity.instagram,
            twitter: entity.twitter,
            facebook: entity.facebook,
        });
        return model;
    }
}