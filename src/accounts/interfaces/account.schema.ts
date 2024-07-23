import * as mongoose from 'mongoose';

export const AccountSchema = new mongoose.Schema({
    planId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
     },
    photo: String,
    name: String,
    email: String,
    documentType: String,
    documentNumber: String,
    address: Object,
    phone: String,
    whatsApp: String,
    webSite: String,
    socialMedia: Object,
    description: String,
    status: String,
}, { timestamps: true, collection: 'accounts' });