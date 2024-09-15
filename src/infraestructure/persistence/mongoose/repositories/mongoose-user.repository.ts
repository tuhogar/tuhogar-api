import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User as UserMongoose } from "../entities/user.entity"
import { IUserRepository } from "src/application/interfaces/repositories/user.repository.interface";
import { Account } from "src/domain/entities/account.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { User, UserStatus } from "src/domain/entities/user.interface";
import { CreateUserDto } from "src/infraestructure/http/dtos/user/create-user.dto";
import { PatchUserDto } from "src/infraestructure/http/dtos/user/patch-user.dto";

export class MongooseUserRepository implements IUserRepository {
    constructor(
        @InjectModel(UserMongoose.name) private readonly userModel: Model<UserMongoose>,
    ) {}
    
    async create(authenticatedUser: AuthenticatedUser, createUserDto: CreateUserDto, accountCreated: Account): Promise<any> {
        const userCreated = new this.userModel({
            ...createUserDto,
            email: authenticatedUser.email,
            uid: authenticatedUser.uid,
            status: UserStatus.ACTIVE,
            accountId: accountCreated.id,
         });
        
         await userCreated.save();

         return userCreated;
    }
    
    async deleteOne(filter: any): Promise<void> {
        await this.userModel.deleteOne(filter).exec();
    }
    
    async find(filter: any): Promise<any[]> {
        return this.userModel.find(filter).exec();
    }
    
    async findOne(filter: any): Promise<any> {
        return this.userModel.findOne(filter).populate('accountId').exec();
    }
    
    async findOneAndUpdate(filter: any, data: any, returnNew: boolean = false): Promise<any> {
        return this.userModel.findOneAndUpdate(
            filter,
            data,
            { new: returnNew }
        ).exec();
    }
    
    async findById(userId: string): Promise<any> {
        return this.userModel.findById(userId).populate({
            path: 'advertisementFavorites',
            populate: [
                { path: 'amenities' },
                { path: 'communityAmenities' }
            ],
        }).exec();
    }
}