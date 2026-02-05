import { ApiProperty } from '@nestjs/swagger';

export class GetAllBlacklistWordsOutputDto {
  @ApiProperty({
    description: 'ID único da palavra',
    example: '60f1e5b5e6c7a32d8c9e4b3a'
  })
  id: string;

  @ApiProperty({
    description: 'Palavra',
    example: 'Palavra'
  })
  word: string;
}
