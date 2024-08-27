import { Module } from "@nestjs/common";
import { HttpModule } from "src/infraestructure/http/http.module";

@Module({
    imports: [HttpModule],
    controllers: [],
    providers: [],
})
export class TuhogarModule {}