import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { AdvertisementStatus, AdvertisementTransactionType, AdvertisementType } from "src/domain/entities/advertisement";
import { AdvertisementIsStatusValid } from "../../validators/advertisement/advertisement-is-status-valid.validator";

export class GetAdvertisementDto {
    @ApiProperty()
    @IsNumber({}, { message: 'invalid.id.must.be.a.number' })
    @Type(() => Number)
    @IsOptional()
    code: number;

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId({ message: 'invalid.accountId' })
    accountId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(AdvertisementStatus, { each: true })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    status: AdvertisementStatus[];
}