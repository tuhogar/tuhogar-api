import { Account, AccountDocumentType, AccountStatus } from "src/domain/entities/account";
import { AddressDto } from "src/infraestructure/http/dtos/address/address.dto";
import { SocialMediaDto } from "src/infraestructure/http/dtos/social-media/create-social-media.dto";

export abstract class IAccountRepository {
    abstract find(): Promise<Account[]>
    abstract findActives(): Promise<Account[]>
    abstract findOneById(id: string): Promise<Account>
    abstract findOneByEmail(email: string): Promise<Account>
    abstract create(account: Account): Promise<Account>
    abstract deleteImage(id: string): Promise<Account>
    abstract update(
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
        contractTypes: string[]): Promise<Account>
    abstract updateImage(id: string, imageUrl: string): Promise<Account>
    abstract updateStatus(id: string, status: AccountStatus): Promise<Account>
    abstract findInactiveAccounts(): Promise<Account[]>
    abstract getRegisteredAccounts(period: 'week' | 'month'): Promise<any[]>
    abstract delete(id: string): Promise<void>
    abstract updatePlan(id: string, planId: string): Promise<Account>
    abstract findOneByIdWithSubscription(id: string): Promise<Account>
    /**
     * Atualiza o campo hasPaidPlan de uma conta
     * @param id ID da conta
     * @param hasPaidPlan Valor booleano indicando se o usuário já assinou algum plano pago
     * @returns A conta atualizada
     */
    abstract updateHasPaidPlan(id: string, hasPaidPlan: boolean): Promise<Account>
}