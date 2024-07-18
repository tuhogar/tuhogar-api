import * as mongoose from 'mongoose';

export const AdvertisementReportSchema = new mongoose.Schema({
    advertisementId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement',
    },
    advertisementReasonId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdvertisementReason',
    },
}, { timestamps: true, collection: 'advertisement-reports' });