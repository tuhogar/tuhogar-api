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


    transactionType: String,
    propertyStatus: String,
    propertyType: String,
    allContentsIncluded: Boolean,
    isResidentialComplex: Boolean,
    isPenthouse: Boolean,
    bedsCount: Number,
    bathsCount: Number,
    parkingCount: Number,
    floorsCount: Number,
    constructionYear: Number,
    socioEconomicLevel: Number,
    isHoaIncluded: Boolean,
    amenities: Array,
    hoaFee: Number,
    lotArea: Number,
    floorArea: Number,
    price: Number,
    pricePerFloorArea: Number,
    pricePerLotArea: Number,
    address: Object,
    photos: Array,
    tourUrl: String,
    videoUrl: String,
    isActive: Boolean,
    isPaid: Boolean,
    publishedAt: Date,
    approvingUserId: String,
}, { timestamps: true, collection: 'advertisements' });