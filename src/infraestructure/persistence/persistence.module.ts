import { DynamicModule, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

interface DatabaseOptions {
    type: 'prisma' | 'mongoose';
    global?: boolean;
}

@Module({})
export class PersistenceModule {
    static async register({ global = false, type }: DatabaseOptions): Promise<DynamicModule> {
        return {
            global,
            module: PersistenceModule,
            imports: [type === 'mongoose' ? MongooseModule : MongooseModule], // imports: [type === 'mongoose' ? MongooseModule : PrismaModule]
            exports: [type === 'mongoose' ? MongooseModule : MongooseModule], // imports: [type === 'mongoose' ? MongooseModule : PrismaModule]
        };
    };
}