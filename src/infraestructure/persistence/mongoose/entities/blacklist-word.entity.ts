import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'blacklist-words' })
export class BlacklistWord {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    word: string;

    @Prop()
    createdAt: Date
}

const BlacklistWordSchema = SchemaFactory.createForClass(BlacklistWord);

export { BlacklistWordSchema };