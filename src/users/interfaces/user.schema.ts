import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    uid: { type: String, unique: true },
    accountId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
     },
    userRole: String,
    status: String,
    documentType: String,
    documentNumber: String,
    address: Object,
    phone: String,
    whatsApp: String,
    webSite: String,
    socialMedia: Object,
    description: String,
    photo: String,
}, { timestamps: true, collection: 'users' });