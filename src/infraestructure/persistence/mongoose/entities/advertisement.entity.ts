import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'advertisements' })
export class Advertisement {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    createdUserId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    updatedUserId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    approvingUserId: mongoose.Schema.Types.ObjectId;

    @Prop()
    code: number;

    @Prop()
    description: string;

    @Prop()
    status: string;

    @Prop()
    transactionType: string;

    @Prop()
    type: string;

    @Prop()
    constructionType: string;

    @Prop()
    allContentsIncluded: boolean;

    @Prop()
    isResidentialComplex: boolean;

    @Prop()
    isPenthouse: boolean;

    @Prop()
    bedsCount: number;

    @Prop()
    bathsCount: number;

    @Prop()
    parkingCount: number;

    @Prop()
    floorsCount: number;

    @Prop()
    constructionYear: number;

    @Prop()
    socioEconomicLevel: number;

    @Prop()
    isHoaIncluded: boolean;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }])
    amenities: [mongoose.Schema.Types.ObjectId];

    @Prop()
    hoaFee: number;

    @Prop()
    lotArea: number;

    @Prop()
    floorArea: number;

    @Prop()
    price: number;

    @Prop()
    pricePerFloorArea: number;

    @Prop()
    pricePerLotArea: number;

    @Prop()
    propertyTax: number;

    @Prop({ type: Object })
    address: Object;

    @Prop([{ type: Object }])
    photos: [Object];

    @Prop()
    tourUrl: string;

    @Prop()
    videoUrl: string;

    @Prop()
    isActive: boolean;

    @Prop()
    isPaid: boolean;

    @Prop()
    publishedAt: Date;
}

const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);

export { AdvertisementSchema };