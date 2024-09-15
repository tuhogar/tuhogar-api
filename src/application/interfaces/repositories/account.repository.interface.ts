import { Account } from "src/domain/entities/account.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { CreateAccountDto } from "src/infraestructure/http/dtos/account/create-account.dto";
import { PatchAccountDto } from "src/infraestructure/http/dtos/account/patch-account.dto";

export abstract class IAccountRepository {
    abstract find(): Promise<Account[]>
    abstract findOne(id: string): Promise<Account>
    abstract create(authenticatedUser: AuthenticatedUser, createAccountDto: CreateAccountDto): Promise<Account>
    abstract findOneAndUpdate(filter: any, data: any, returnNew?: boolean): Promise<Account>
    abstract findInactiveAccounts(): Promise<Account[]>
    abstract getRegisteredAccounts(period: 'week' | 'month'): Promise<any[]>
    abstract deleteOne(accountId: string): Promise<void>

}