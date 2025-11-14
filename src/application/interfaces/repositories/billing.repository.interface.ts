import { AccountDocumentType } from "src/domain/entities/account";
import { Billing } from "src/domain/entities/billing";

export abstract class IBillingRepository {
    abstract findOneByAccountId(accountId: string): Promise<Billing>
    abstract create(billing: Billing): Promise<Billing>
    abstract update(
        accountId: string,
        name: string,
        email: string,
        phone: string,
        address: string,
        documentType: AccountDocumentType,
        documentNumber: string,
    ): Promise<Billing>
}