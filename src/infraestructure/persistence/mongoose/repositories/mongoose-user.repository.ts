import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User as UserMongoose } from "../entities/user.entity"
import { IUserRepository } from "src/application/interfaces/repositories/user.repository.interface";
import { Account } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { User, UserRole, UserStatus } from "src/domain/entities/user";
import { MongooseUserMapper } from "../mapper/mongoose-user.mapper";
import { MongooseAccountMapper } from "../mapper/mongoose-account.mapper";

export class MongooseUserRepository implements IUserRepository {
    constructor(
        @InjectModel(UserMongoose.name) private readonly userModel: Model<UserMongoose>,
    ) {}
    
    async create(name: string, email: string, uid: string, userRole: UserRole, accountId: string): Promise<User> {
        const data = MongooseUserMapper.toMongoose({
            name,
            email,
            uid,
            userRole,
            status: UserStatus.ACTIVE,
            accountId,
         });

        const entity = new this.userModel(data);
         await entity.save();

         return MongooseUserMapper.toDomain(entity);
    }
    
    async deleteOne(id: string): Promise<void> {
        await this.userModel.deleteOne({ _id: id }).exec();
    }
    
    async findByAccountIdAndUserRole(accountId: string, userRole?: UserRole): Promise<User[]> {
        const filter: any = { accountId };
        
        if (userRole) filter.userRole == userRole;
        
        const query = await this.userModel.find(filter).exec();
        return query.map((item) => MongooseUserMapper.toDomain(item));
    }

    async findOneByUid(uid: string): Promise<User> {
        const query = await this.userModel.findOne({ uid }).populate('accountId').exec();
        return MongooseUserMapper.toDomain(query);
    }
    
    async update(id: string, name: string, phone: string, whatsApp: string): Promise<User> {
        const update: any = {};

        if (name) update.name = name;
        if (phone) update.phone = phone;
        if (whatsApp) update.whatsApp = whatsApp;

        const updated = await this.userModel.findOneAndUpdate(
            { _id: id },
            update,
            { new: true }
        ).exec();

        if (updated) {
            const user = updated;
            return this.findOneById(user._id.toString());
        }

        return null;
    }

    async updateStatus(id: string, status: UserStatus): Promise<User> {
        const updated = await this.userModel.findOneAndUpdate(
            { _id: id },
            { status },
            { new: false }
        ).exec();

        if (updated) {
            const user = updated;
            return this.findOneById(user._id.toString());
        }

        return null;
    }

    async deleteFavoriteAdvertisement(id: string, advertisementId: string): Promise<User> {
        const updated = await this.userModel.findOneAndUpdate(
            { _id: id },
            { $pull: { advertisementFavorites: advertisementId } },
            { new: true }
        ).exec();

        if (updated) {
            const user = updated;
            return this.findOneById(user._id.toString());
        }

        return null;
    }

    async addFavoriteAdvertisement(id: string, advertisementId: string): Promise<User> {
        const updated = await this.userModel.findOneAndUpdate(
            { _id: id },
            { $addToSet: { advertisementFavorites: advertisementId } },
            { new: true }
        ).exec();

        if (updated) {
            const user = updated;
            return this.findOneById(user._id.toString());
        }

        return null;
    }
    
    async findOneById(id: string): Promise<User> {
        const query = await this.userModel.findById(id).populate({
            path: 'advertisementFavorites',
            populate: [
                { path: 'amenities' },
                { path: 'communityAmenities' }
            ],
        }).exec();

        return MongooseUserMapper.toDomain(query);
    }

    async findByAccountId(accountId: string): Promise<User[]> {
        const users = await this.userModel.find({ accountId })
            .populate('accountId')
            .exec();
    
        const usersWithSubscriptions = await Promise.all(
            users.map(async (user) => {
                // Usamos `aggregate` para buscar as subscriptions associadas ao accountId
                const subscriptions = await this.userModel.aggregate([
                    { $match: { _id: user._id } },
                    {
                        $lookup: {
                            from: 'subscriptions', // Nome da collection de subscriptions
                            localField: 'accountId',
                            foreignField: 'accountId',
                            as: 'subscriptions'
                        }
                    },
                    { $unwind: '$subscriptions' },
                    { $replaceRoot: { newRoot: { $mergeObjects: ['$subscriptions', '$$ROOT'] } } }, // Inclui todos os campos de subscriptions
                    { $sort: { 'subscriptions.createdAt': -1 } }, // Ordena as subscriptions
                    {
                        $group: {
                            _id: '$_id',
                            user: { $first: '$$ROOT' },
                            subscriptions: { $push: '$subscriptions' }
                        }
                    }
                ]);
    
                // Converte `subscriptions` para objetos JSON completos
                const subscriptionsJSON = subscriptions[0]?.subscriptions.map(sub =>
                    JSON.parse(JSON.stringify(sub))
                ) || [];

                
    
                // Converte `accountId` para um objeto plano JSON e adiciona `subscriptions`
                const accountWithSubscriptions = {
                    ...JSON.parse(JSON.stringify(user.accountId)),
                    subscriptions: subscriptionsJSON
                };

                user = {
                    ...JSON.parse(JSON.stringify(user)),
                    accountId: accountWithSubscriptions
                };
    
                // Retorna o user com `account` contendo `subscriptions` ordenadas
                return user;
            })
        );

        return usersWithSubscriptions.map((item) => MongooseUserMapper.toDomain(item));
    }
    
}