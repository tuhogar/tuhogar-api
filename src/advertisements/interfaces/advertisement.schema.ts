import * as mongoose from 'mongoose';

export const AdvertisementSchema = new mongoose.Schema({
    accountId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
     },
     userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
     },
    description: String,
    status: String,
}, { timestamps: true, collection: 'advertisements' });