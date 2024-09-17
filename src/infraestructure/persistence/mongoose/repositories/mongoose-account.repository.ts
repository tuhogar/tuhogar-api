import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IAccountRepository } from "src/application/interfaces/repositories/account.repository.interface";
import { Account, AccountStatus } from "src/domain/entities/account.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { CreateAccountDto } from "src/infraestructure/http/dtos/account/create-account.dto";
import { Account as AccountMongoose } from "../entities/account.entity"

export class MongooseAccountRepository implements IAccountRepository {
    constructor(
        @InjectModel(AccountMongoose.name) private readonly accountModel: Model<AccountMongoose>,
    ) {}
    
    async find(): Promise<any> { // async getAll(): Promise<Account[]> {
        return this.accountModel.find().populate('planId').exec();
    }
    
    async findOne(id: string): Promise<any> { // async getById(id: string): Promise<Account> {
        return this.accountModel.findOne({ _id: id }).select('_id name description phone socialMedia webSite whatsApp address photo').exec();
    }
    
    async create(authenticatedUser: AuthenticatedUser, createAccountDto: CreateAccountDto): Promise<any> { // async create(authenticatedUser: AuthenticatedUser, createAccountDto: CreateAccountDto): Promise<Account> {
        const accountCreated = new this.accountModel({
            planId: createAccountDto.planId,
            name: createAccountDto.name,
            email: authenticatedUser.email,
            phone: createAccountDto.phone,
            documentType: createAccountDto.documentType,
            documentNumber: createAccountDto.documentNumber,
            status: AccountStatus.ACTIVE,
        });
        
        await accountCreated.save();

        return accountCreated;
    }
    
    async findOneAndUpdate(filter: any, data: any, returnNew: boolean = false): Promise<any> { // async patch(filter: any, patchAccountDto: PatchAccountDto): Promise<Account> {
      return this.accountModel.findOneAndUpdate(
          filter,
          data,
          { new: returnNew }
      ).exec();
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

    async deleteOne(accountId: string): Promise<void> {
        await this.accountModel.deleteOne({ _id: accountId }).exec();
    }
}