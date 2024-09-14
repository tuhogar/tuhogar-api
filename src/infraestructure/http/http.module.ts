import { forwardRef, Module } from "@nestjs/common";
import { PlanController } from "./controllers/plan.controller";
import { IsExistingPlanConstraint } from "./validators/plan/is-existing-plan.validator";
import { AmenityIsExistingIdConstraint } from "src/infraestructure/http/validators/amenity/amenitiy-is-existing-id.validator";
import { AmenityController } from "./controllers/amenity.controller";
import { AdvertisementReportController } from "./controllers/advertisement-report.controller";
import { IsExistingAdvertisementReasonConstraint } from "./validators/advertisement-reason/is-existing-advertisement-reason.validator";
import { UserAlreadyExistsConstraint } from "./validators/user/user-already-exists.validator";
import { UserService } from "src/application/use-cases/user/user.service";
import { AdvertisementReasonController } from "./controllers/advertisement-reason.controller";
import { AccountController } from "./controllers/accounts.controller";
import { AccountService } from "src/application/use-cases/account/account.service";
import { AdvertisementCodeService } from "src/application/use-cases/advertisement-code/advertisement-code.service";
import { AdvertisementReasonService } from "src/application/use-cases/advertisement-reason/advertisement-reason.service";
import { AdvertisementReportService } from "src/application/use-cases/advertisement-report/advertisement-report.service";
import { AdvertisementService } from "src/application/use-cases/advertisement/advertisement.service";
import { AdvertisementController } from "./controllers/advertisement-controller";
import { AmenityService } from "src/application/use-cases/amenity/amenity.service";
import { BulkUpdateDateService } from "src/application/use-cases/bulk-update-date/bulk-update-date.service";
import { PlanService } from "src/application/use-cases/plan/plan.service";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { OpenAiModule } from "../open-ai/open-ai.module";
import { AlgoliaModule } from "../algolia/algolia.module";
import { FirebaseAdmin } from "../config/firebase.config";

@Module({
    imports: [
        AlgoliaModule,
        OpenAiModule,
        CloudinaryModule,
    ],
    providers: [
        AccountService,
        AdvertisementCodeService,
        AdvertisementReasonService,
        AdvertisementReportService,
        AdvertisementService,
        AmenityService,
        BulkUpdateDateService,
        PlanService,
        UserService,
        IsExistingAdvertisementReasonConstraint,
        AmenityIsExistingIdConstraint,
        IsExistingPlanConstraint,
        UserAlreadyExistsConstraint,
        FirebaseAdmin,
    ],
    controllers: [
        AccountController,
        AdvertisementReasonController,
        AdvertisementReportController,
        AdvertisementController,
        AmenityController,
        PlanController,
        ],
})
export class HttpModule {}