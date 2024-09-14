import { BulkUpdateDate } from "src/domain/entities/bulk-update-date.interface";

export abstract class IBulkUpdateDateRepository {
    abstract update(updatedAt: Date): Promise<void>
    abstract get(): Promise<BulkUpdateDate>
}