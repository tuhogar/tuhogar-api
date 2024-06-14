import * as mongoose from 'mongoose';

export const AdvertisementCodeSchema = new mongoose.Schema({
    code: { type: Number, required: true },
}, { timestamps: true, collection: 'advertisement-codes' });