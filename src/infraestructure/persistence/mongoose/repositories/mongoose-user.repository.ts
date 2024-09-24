import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User as UserMongoose } from "../entities/user.entity"
import { IUserRepository } from "src/application/interfaces/repositories/user.repository.interface";
import { Account } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { User, UserStatus } from "src/domain/entities/user";
import { MongooseUserMapper } from "../mapper/mongoose-user.mapper";

export class MongooseUserRepository implements IUserRepository {
    constructor(
        @InjectModel(UserMongoose.name) private readonly userModel: Model<UserMongoose>,
    ) {}
    
    async create(authenticatedUser: AuthenticatedUser, user: User, accountCreated: Account): Promise<User> {
        const data = MongooseUserMapper.toMongoose({
            ...user,
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            status: UserStatus.ACTIVE,
            accountId: accountCreated.id,
         });

        const entity = new this.userModel(data);
         await entity.save();

         return MongooseUserMapper.toDomain(entity);
    }
    
    async deleteOne(id: string): Promise<void> {
        await this.userModel.deleteOne({ _id: id }).exec();
    }
    
    async find(filter: any): Promise<User[]> {
        const query = await this.userModel.find(filter).exec();
        return query.map((item) => MongooseUserMapper.toDomain(item));
    }
    
    async findOne(filter: any): Promise<User> {
        const query = await this.userModel.findOne(filter).populate('accountId').exec();
        return MongooseUserMapper.toDomain(query);
    }
    
    async findOneAndUpdate(filter: any, data: any, returnNew: boolean = false): Promise<User> {
        const updated = await this.userModel.findOneAndUpdate(
            filter,
            data,
            { new: returnNew }
        ).exec();

        if (updated) {
            const user = updated;
            return this.findById(user._id.toString());
        }

        return null;
    }
    
    async findById(userId: string): Promise<User> {
        const query = await this.userModel.findById(userId).populate({
            path: 'advertisementFavorites',
            populate: [
                { path: 'amenities' },
                { path: 'communityAmenities' }
            ],
        }).exec();

        return MongooseUserMapper.toDomain(query);
    }
}