import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { PlanSchema } from './interfaces/plan.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Plan', schema: PlanSchema }])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
