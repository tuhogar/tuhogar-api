import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IAccountRepository } from "src/application/interfaces/repositories/account.repository.interface";
import { Account, AccountDocumentType, AccountStatus } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { Account as AccountMongoose } from "../entities/account.entity"
import { MongooseAccountMapper } from "../mapper/mongoose-account.mapper";
import { AddressDto } from "src/infraestructure/http/dtos/address/address.dto";
import { SocialMediaDto } from "src/infraestructure/http/dtos/social-media/create-social-media.dto";

export class MongooseAccountRepository implements IAccountRepository {
    constructor(
        @InjectModel(AccountMongoose.name) private readonly accountModel: Model<AccountMongoose>,
    ) {}
    
    async findActives(): Promise<Account[]> {
      const query = await this.accountModel.find({ status: AccountStatus.ACTIVE }).exec();
      return query.map((item) => MongooseAccountMapper.toDomain(item));
    }
    
    async find(): Promise<Account[]> {
        const query = await this.accountModel.find().exec();
        return query.map((item) => MongooseAccountMapper.toDomain(item));
    }
    
    async findOneById(id: string): Promise<Account> {
      const query = await this.accountModel.findById(id).populate('contractTypes').exec();
      return MongooseAccountMapper.toDomain(query);
    }

    async findOneByEmail(email: string): Promise<Account> {
      const query = await this.accountModel.findOne({ email }).exec();
      return MongooseAccountMapper.toDomain(query);
    }
    
    async create(account: Account): Promise<Account> {
      const data = MongooseAccountMapper.toMongoose({ ...account });


        const entity = new this.accountModel({ ...data });
        await entity.save();

        return MongooseAccountMapper.toDomain(entity);
    }

    async deleteImage(id: string): Promise<Account> {
      const updated = await this.accountModel.findOneAndUpdate(
        { _id: id },
        { $unset: { photo: '' } },
        { new: true }
      ).exec();

      if (updated) {
        return MongooseAccountMapper.toDomain(updated);
      }

      return null;
    }

    async update(
      id: string, 
      documentType: AccountDocumentType,
      documentNumber: string,
      name: string,
      address: AddressDto,
      phone: string,
      whatsApp: string,
      phone2: string,
      whatsApp2: string,
      webSite: string,
      socialMedia: SocialMediaDto,
      description: string,
      contractTypes: string[],
    ): Promise<Account> {

      const update: any = { documentType, documentNumber };

      if (name !== undefined) update.name = name;
      if (address !== undefined) update.address = address;
      if (phone !== undefined) update.phone = phone;
      if (whatsApp !== undefined) update.whatsApp = whatsApp;
      if (phone2 !== undefined) update.phone2 = phone2;
      if (whatsApp2 !== undefined) update.whatsApp2 = whatsApp2;
      if (webSite !== undefined) update.webSite = webSite;
      if (socialMedia !== undefined) update.socialMedia = socialMedia;
      if (description !== undefined) update.description = description;
      if (contractTypes !== undefined) update.contractTypes = contractTypes;

      const updated = await this.accountModel.findOneAndUpdate(
        { _id: id },
        update,
        { new: true },
      ).exec();

      if (updated) {
        return MongooseAccountMapper.toDomain(updated);
      }

      return null;
    }
    
    async updateImage(id: string, imageUrl: string): Promise<Account> {
      const updated = await this.accountModel.findOneAndUpdate(
        { _id: id },
          { photo: imageUrl },
          { new: true }
      ).exec();

      if (updated) {
        return MongooseAccountMapper.toDomain(updated);
      }

      return null;
    }

    async updateStatus(id: string, status: AccountStatus): Promise<Account> {
      const updated = await this.accountModel.findOneAndUpdate(
        { _id: id },
        { status },
        { new: false }
      ).exec();

      if (updated) {
        return MongooseAccountMapper.toDomain(updated);
      }

      return null;
    }
    
    async findInactiveAccounts(): Promise<Account[]> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const accounts = await this.accountModel.aggregate([
        {
            $match: {
            createdAt: {
                $lt: twentyFourHoursAgo
            }
            }
        },
        {
            $lookup: {
            from: 'advertisements',
            localField: '_id',
            foreignField: 'accountId',
            as: 'advertisements'
            }
        },
        {
            $match: {
            'advertisements': { $size: 0 }
            }
        },
        {
            $project: {
            _id: 1,
            planId: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
            }
        }
        ]);

        return accounts.map((item) => MongooseAccountMapper.toDomain(item));
    }
    
    async getRegisteredAccounts(period: "week" | "month"): Promise<any> {
      let groupId: any;
      if (period === 'week') {
        groupId = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
      } else {
        groupId = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
      }

      const accounts = await this.accountModel.aggregate([
        {
          $group: {
            _id: groupId,
            count: { $sum: 1 }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.week': 1,
            '_id.month': 1
          }
        }
      ]);

      return accounts;
    }

    async delete(id: string): Promise<void> {
        await this.accountModel.deleteOne({ _id: id }).exec();
    }

    async updatePlan(id: string, planId: string): Promise<Account> {
      const updated = await this.accountModel.findOneAndUpdate(
        { _id: id },
        { $set: { planId } },
        { new: true }
      ).exec();

      if (updated) {
        return MongooseAccountMapper.toDomain(updated);
      }

      return null;
    }

    async findOneByIdWithSubscription(id: string): Promise<Account> {
      // Primeiro, buscamos a conta básica
      const account = await this.accountModel.findById(id)
        .populate('contractTypes')
        .exec();
      
      if (!account) {
        return null;
      }

      // Usamos aggregate para buscar as subscriptions associadas à conta
      const subscriptions = await this.accountModel.aggregate([
        { $match: { _id: account._id } },
        {
          $lookup: {
            from: 'subscriptions', // Nome da collection de subscriptions
            localField: '_id',
            foreignField: 'accountId',
            as: 'subscriptions'
          }
        },
        { $sort: { 'subscriptions.createdAt': -1 } },
        { $limit: 1 }
      ]);

      // Converte subscriptions para objetos JSON completos
      const subscriptionsJSON = subscriptions[0]?.subscriptions?.map(sub =>
        JSON.parse(JSON.stringify(sub))
      ) || [];

      // Converte a conta para um objeto plano JSON e adiciona subscriptions
      const accountWithSubscriptions = {
        ...JSON.parse(JSON.stringify(account)),
        subscriptions: subscriptionsJSON
      };

      // Retorna a conta com subscriptions
      return MongooseAccountMapper.toDomain(accountWithSubscriptions);
    }
}