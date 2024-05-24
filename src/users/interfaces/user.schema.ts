import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    accountId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
     },
    userRole: String,
    status: String,
}, { timestamps: true, collection: 'users' });