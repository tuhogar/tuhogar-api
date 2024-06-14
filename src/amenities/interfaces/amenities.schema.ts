import * as mongoose from 'mongoose';

export const AmenitySchema = new mongoose.Schema({
    key: String,
    name: String,
}, { timestamps: true, collection: 'amenities' });