import * as mongoose from 'mongoose';

export const BulkUpdateDateSchema = new mongoose.Schema({
}, { timestamps: { createdAt: false, updatedAt: true }, collection: 'bulk-update-date' });