import { Module } from '@nestjs/common';
import { AlgoliaService } from './algolia.service';
import { FirebaseAdmin } from 'src/config/firebase.setup';

@Module({
  providers: [AlgoliaService],
  exports: [AlgoliaService],
})
export class AlgoliaModule {}
