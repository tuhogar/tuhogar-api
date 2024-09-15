import { BulkUpdateDate } from "src/domain/entities/bulk-update-date.interface";

export abstract class IBulkUpdateDateRepository {
    abstract findOneAndUpdate(updatedAt: Date): Promise<void>
    abstract findOne(): Promise<BulkUpdateDate>
}