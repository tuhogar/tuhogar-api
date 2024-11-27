import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IAccountRepository } from "src/application/interfaces/repositories/account.repository.interface";
import { Account, AccountStatus } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { Account as AccountMongoose } from "../entities/account.entity"
import { MongooseAccountMapper } from "../mapper/mongoose-account.mapper";

export class MongooseAccountRepository implements IAccountRepository {
    constructor(
        @InjectModel(AccountMongoose.name) private readonly accountModel: Model<AccountMongoose>,
    ) {}
    
    async find(): Promise<Account[]> {
        const query = await this.accountModel.find().exec();
        return query.map((item) => MongooseAccountMapper.toDomain(item));
    }
    
    async findById(id: string): Promise<Account> {
      const query = await this.accountModel.findById(id).populate('contractTypes').exec();
      return MongooseAccountMapper.toDomain(query);
    }

    async findOneByEmail(email: string): Promise<Account> {
      const query = await this.accountModel.findOne({ email }).exec();
      return MongooseAccountMapper.toDomain(query);
    }
    
    async create(authenticatedUser: AuthenticatedUser, account: Account): Promise<Account> {
      const data = MongooseAccountMapper.toMongoose({
        planId: account.planId,
        name: account.name,
        email: authenticatedUser.email,
        phone: account.phone,
        documentType: account.documentType,
        documentNumber: account.documentNumber,
        status: AccountStatus.ACTIVE,
        photo: account.phone,
        address: account.address,
        whatsApp: account.whatsApp,
        webSite: account.webSite,
        socialMedia: account.socialMedia,
        description: account.description,
      });


        const entity = new this.accountModel(data);
        await entity.save();

        return MongooseAccountMapper.toDomain(entity);
    }
    
    async findOneAndUpdate(filter: any, data: any, returnNew: boolean = false): Promise<Account> {
      const updated = await this.accountModel.findOneAndUpdate(
          filter,
          data,
          { new: returnNew }
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

        return accounts;
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

    async deleteOne(id: string): Promise<void> {
        await this.accountModel.deleteOne({ _id: id }).exec();
    }

    async updatePlan(id: string, planId: string): Promise<Account> {
      const updated = await this.accountModel.findOneAndUpdate(
          { _id: id },
          { planId },
          { new: true }
      ).exec();

      if (updated) {
        return MongooseAccountMapper.toDomain(updated);
      }

      return null;
    }
}