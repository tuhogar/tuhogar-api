import * as mongoose from 'mongoose';

export const PlanSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
}, { timestamps: true, collection: 'plans' });