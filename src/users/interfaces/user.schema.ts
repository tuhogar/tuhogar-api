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
    phone: String,
    whatsApp: String,
    advertisementFavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' }],
}, { timestamps: true, collection: 'users' });