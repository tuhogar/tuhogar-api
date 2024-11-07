import { Account } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { CreateAccountDto } from "src/infraestructure/http/dtos/account/create-account.dto";

export abstract class IAccountRepository {
    abstract find(): Promise<Account[]>
    abstract findById(id: string): Promise<Account>
    abstract create(authenticatedUser: AuthenticatedUser, createAccountDto: CreateAccountDto): Promise<Account>
    abstract findOneAndUpdate(filter: any, data: any, returnNew?: boolean): Promise<Account>
    abstract findInactiveAccounts(): Promise<Account[]>
    abstract getRegisteredAccounts(period: 'week' | 'month'): Promise<any[]>
    abstract deleteOne(id: string): Promise<void>
    abstract updatePlan(id: string, planId: string): Promise<Account>
}