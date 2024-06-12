import { applyDecorators, UseGuards, SetMetadata, UsePipes } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { StripRequestContextPipe } from "src/pipes/strip.request.context.pipe";

export function Auth(...permissions: string[]) {
    return applyDecorators(SetMetadata("permissions", permissions), UseGuards(AuthGuard), UsePipes(StripRequestContextPipe));
}