import * as mongoose from 'mongoose';

export const AccountSchema = new mongoose.Schema({
    planId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
     },
    status: String,
}, { timestamps: true, collection: 'accounts' });