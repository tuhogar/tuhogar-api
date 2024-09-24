import { User, UserRole, UserStatus } from 'src/domain/entities/user';
import * as mongoose from 'mongoose';
import { User as UserDocument } from '../entities/user.entity';
import { Advertisement } from '../entities/advertisement.entity';
import { MongooseAdvertisementMapper } from './mongoose-advertisement.mapper';
import { MongooseAccountMapper } from './mongoose-account.mapper';

export class MongooseUserMapper {
    
    static toDomain(entity: UserDocument): User {
        if (!entity) return null;

        const model = new User({
            _id: entity._id.toString(),
            id: entity._id.toString(),
            name: entity.name,
            email: entity.email,
            accountId: !entity.accountId.createdAt ? entity.accountId?.toString() : entity.accountId._id.toString(),
            userRole: entity.userRole as UserRole,
            status: entity.status as UserStatus,
            uid: entity.uid,
            phone: entity.phone,
            whatsApp: entity.whatsApp,
            advertisementFavorites: !!entity.advertisementFavorites ? entity.advertisementFavorites.map((a) => MongooseAdvertisementMapper.toDomain(a)) : undefined,
            account: entity.accountId.createdAt ? MongooseAccountMapper.toDomain(entity.accountId) : undefined,
        });
        return model;
    }

    static toMongoose(user: User) {
        return {
            name: user.name,
            email: user.email,
            accountId: user.accountId,
            userRole: user.userRole,
            status: user.status,
            uid: user.uid,
            phone: user.phone,
            whatsApp: user.whatsApp,
            advertisementFavorites: user.advertisementFavorites,
        }
    }
}