import { ApiProperty } from '@nestjs/swagger';

export class GetAllPlansOutputDto {
  @ApiProperty({
    description: 'ID único do plano',
    example: '60f1e5b5e6c7a32d8c9e4b3a'
  })
  id: string;

  @ApiProperty({
    description: 'Nome do plano',
    example: 'Plano Premium'
  })
  name: string;

  @ApiProperty({
    description: 'Número de dias gratuitos no período de teste',
    example: 30,
    required: false,
    nullable: true
  })
  freeTrialDays: number | null;

  @ApiProperty({
    description: 'Lista de itens/benefícios incluídos no plano',
    example: ['Até 10 anúncios', 'Até 20 fotos por anúncio', 'Destaque na busca'],
    type: [String]
  })
  items: string[];

  @ApiProperty({
    description: 'Preço do plano',
    example: 99.90
  })
  price: number;

  @ApiProperty({
    description: 'Máximo de anúncios',
    example: 2
  })
  maxAdvertisements: number;

  @ApiProperty({
    description: 'Máximo de fotos por anúncio',
    example: 20
  })
  maxPhotos: number;

  @ApiProperty({
    description: 'URL da foto do plano',
    example: 'https://example.com/images/premium-plan.jpg',
    required: false,
    nullable: true
  })
  photo: string | null;
}
