import { Account } from "src/domain/entities/account.interface";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user.interface";
import { CreateAccountDto } from "src/infraestructure/http/dtos/account/create-account.dto";
import { PatchAccountDto } from "src/infraestructure/http/dtos/account/patch-account.dto";

export abstract class IAccountRepository {
    abstract getAll(): Promise<Account[]>
    abstract getById(id: string): Promise<Account>
    abstract create(authenticatedUser: AuthenticatedUser, createAccountDto: CreateAccountDto): Promise<Account>
    abstract patch(filter: any, patchAccountDto: PatchAccountDto): Promise<Account>
    abstract findOneAndUpdateForUpdateStatus(filter: any, update: any): Promise<Account>
    abstract findByIdAndUpdateForProcessImage(accountId: string, imageUrlStr: string): Promise<any>
    abstract findByIdAndUpdateForDeleteImage(accountId: string): Promise<Account>
    abstract findInactiveAccounts(): Promise<Account[]>
    abstract getAccountRegistrations(period: 'week' | 'month'): Promise<any[]>
    abstract deleteOne(accountId: string): Promise<void>

}