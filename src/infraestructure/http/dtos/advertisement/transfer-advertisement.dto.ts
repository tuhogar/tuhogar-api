import { IsMongoId, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class TransferAdvertisementDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.accountIdFrom.should.not.be.empty' })
    @IsMongoId({ message: 'invalid.accountIdFrom' })
    accountIdFrom: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.accountIdTo.should.not.be.empty' })
    @IsMongoId({ message: 'invalid.accountIdTo' })
    accountIdTo: string;
}