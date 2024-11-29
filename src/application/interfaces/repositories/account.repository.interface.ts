import { Account, AccountDocumentType, AccountStatus } from "src/domain/entities/account";
import { AuthenticatedUser } from "src/domain/entities/authenticated-user";
import { CreateAccountDto } from "src/infraestructure/http/dtos/account/create-account.dto";
import { AddressDto } from "src/infraestructure/http/dtos/address/address.dto";
import { SocialMediaDto } from "src/infraestructure/http/dtos/social-media/create-social-media.dto";

export abstract class IAccountRepository {
    abstract find(): Promise<Account[]>
    abstract findOneById(id: string): Promise<Account>
    abstract findOneByEmail(email: string): Promise<Account>
    abstract create(
        email: string,
        planId: string,
        name: string,
        phone: string,
        documentType: AccountDocumentType,
        documentNumber: string,
    ): Promise<Account>
    abstract deleteImage(accountId: string): Promise<Account>
    abstract update(
        accountId: string,
        documentType: AccountDocumentType,
        documentNumber: string,
        name: string,
        address: AddressDto,
        phone: string,
        whatsApp: string,
        webSite: string,
        socialMedia: SocialMediaDto,
        description: string,
        contractTypes: string[]): Promise<Account>
    abstract updateImage(accountId: string, imageUrl: string): Promise<Account>
    abstract updateStatus(accountId: string, status: AccountStatus): Promise<Account>
    abstract findInactiveAccounts(): Promise<Account[]>
    abstract getRegisteredAccounts(period: 'week' | 'month'): Promise<any[]>
    abstract delete(id: string): Promise<void>
    abstract updatePlan(id: string, planId: string): Promise<Account>
}