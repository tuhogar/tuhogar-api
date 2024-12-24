import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { AdvertisementTransactionType, AdvertisementType } from "src/domain/entities/advertisement";

export class GetAdvertisementDto {
    @ApiProperty()
    @IsString({ message: 'invalid.id.must.be.a.string' })
    @IsOptional()
    id: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.page.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'page.must.not.be.less.than.1' })
    page: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.limit.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'limit.must.not.be.less.than.1' })
    limit: number;

    @ApiProperty()
    @IsEnum(AdvertisementTransactionType, { message: 'invalid.transactionType.must.be.one.of.the.following.values.RENT.SALE' })
    @IsOptional()
    transactionType: AdvertisementTransactionType;

    @ApiProperty()
    @IsEnum(AdvertisementType, { message: 'invalid.type.must.be.one.of.the.following.values.APARTMENT.HOUSE.BUILDING.LOT.WAREHOUSE.OFFICE.COMMERCIAL' })
    @IsOptional()
    type: AdvertisementType;

    @ApiProperty()
    @IsString({ message: 'invalid.externalId.must.be.a.string' })
    @IsOptional()
    externalId: string;
}