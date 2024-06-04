import { Injectable } from '@nestjs/common';
import { Account, AccountStatus } from './interfaces/account.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlansService } from 'src/plans/plans.service';
import { UserDocumentType, UserRole, UserSocialMedia } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { Address } from 'src/addresses/intefaces/address.interface';

@Injectable()
export class AccountsService {

    constructor(
        @InjectModel('Account') private readonly accountModel: Model<Account>,
        private readonly plansService: PlansService,
        private readonly usersService: UsersService,
    ) {}

    async getAll(): Promise<Account[]> {
        return this.accountModel.find().populate('planId').exec();
    }

    async getById(id: string): Promise<Account> {
        return this.accountModel.findOne({ _id: id });
    }

    async create(
        planId: string,
        name: string,
        email: string,
        uid: string,
        //address: Address,
        phone: string,
        //whatsApp: string,
        documentType: UserDocumentType,
        documentNumber: string,
        //webSite: string,
        //socialMedia: UserSocialMedia,
    ): Promise<void> {
        const plan = await this.plansService.getById(planId);
        if (!plan) throw new Error('invalid.do.not.exists.plan');

        const accountCreated = new this.accountModel({
            planId,
            status: AccountStatus.ACTIVE,
        });
        await accountCreated.save();

        try {
            await this.usersService.create(
                name,
                email,
                planId,
                accountCreated._id.toString(),
                AccountStatus.ACTIVE,
                UserRole.ADMIN,
                uid,
                //address,
                phone,
                //whatsApp,
                documentType,
                documentNumber,
                //webSite,
                //socialMedia,
            );
        } catch(error) {
            await this.accountModel.deleteOne({ _id: accountCreated._id.toString() });
            throw error;
        }
    }
}
