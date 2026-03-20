import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { Property } from 'src/infraestructure/decorators/property.decorator';

export class GetAccountEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId({ message: 'invalid.account.id' })
  @Property()
  accountId: string;
}
