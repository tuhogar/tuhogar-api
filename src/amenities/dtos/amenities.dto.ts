import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AmenityIsExistingKey } from '../validators/amenitiy-is-existing-key.validator';
import { AmenityIsExistingName } from '../validators/amenitiy-is-existing-name.validator';

export class AmenityDto {
  @ApiProperty()
  @IsString({ message: 'key.must.be.a.string' })
  @AmenityIsExistingKey()
  key: string;

  @ApiProperty()
  @IsString({ message: 'name.must.be.a.string' })
  @AmenityIsExistingName()
  name: string;
}
