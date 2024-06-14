import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UserSchema } from './interfaces/user.schema';
import { FirebaseAdmin } from 'src/config/firebase.setup';
import { UsersController } from './users.controller';
import { UserAlreadyExistsConstraint } from './validators/user-already-exists.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),],
  controllers: [UsersController],
  providers: [UsersService, FirebaseAdmin, UserAlreadyExistsConstraint],
  exports: [UsersService],
})
export class UsersModule {}
