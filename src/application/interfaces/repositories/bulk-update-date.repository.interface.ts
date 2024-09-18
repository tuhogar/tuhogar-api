import { BulkUpdateDate } from "src/domain/entities/bulk-update-date";

export abstract class IBulkUpdateDateRepository {
    abstract findOneAndUpdate(bulkUpdateDate: BulkUpdateDate): Promise<BulkUpdateDate>
    abstract findOne(): Promise<BulkUpdateDate>
}