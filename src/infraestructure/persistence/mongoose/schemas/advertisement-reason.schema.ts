import * as mongoose from 'mongoose';

export const AdvertisementReasonSchema = new mongoose.Schema({
    name: String,
}, { timestamps: true, collection: 'advertisement-reasons' });