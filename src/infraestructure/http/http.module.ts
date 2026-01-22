import { Module } from "@nestjs/common";
import { PlanController } from "./controllers/plan.controller";
import { IsExistingPlanConstraint } from "./validators/plan/is-existing-plan.validator";
import { AmenityIsExistingIdConstraint } from "src/infraestructure/http/validators/amenity/amenitiy-is-existing-id.validator";
import { AmenityController } from "./controllers/amenity.controller";
import { AdvertisementReportController } from "./controllers/advertisement-report.controller";
import { IsExistingAdvertisementReasonConstraint } from "./validators/advertisement-reason/is-existing-advertisement-reason.validator";
import { UserAlreadyExistsConstraint } from "./validators/user/user-already-exists.validator";
import { AdvertisementReasonController } from "./controllers/advertisement-reason.controller";
import { AccountController } from "./controllers/account.controller";
import { AdvertisementController } from "./controllers/advertisement-controller";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { OpenAiModule } from "../open-ai/open-ai.module";
import { AlgoliaModule } from "../algolia/algolia.module";
import { RedisService } from "../persistence/redis/redis.service";
import { RedisCacheInterceptor } from "./interceptors/redis-cache.interceptor";
import { FirebaseAdmin } from "../config/firebase.config";
import { UserController } from "./controllers/user.controller";
import { CreatePlanUseCase } from "src/application/use-cases/plan/create-plan.use-case";
import { GetAllPlanUseCase } from "src/application/use-cases/plan/get-all-plan.use-case";
import { UpdateBulkUpdateDateUseCase } from "src/application/use-cases/bulk-update-date/update-bulk-update-date.use-case";
import { GetAllAmenityUseCase } from "src/application/use-cases/amenity/get-all-amenity.use-case";
import { CreateAdvertisementReasonUseCase } from "src/application/use-cases/advertisement-reason/create-advertisement-reason.use-case";
import { DeleteAdvertisementReasonUseCase } from "src/application/use-cases/advertisement-reason/delete-advertisement-reason.use-case";
import { GetAllAdvertisementReasonUseCase } from "src/application/use-cases/advertisement-reason/get-all-advertisement-reason.use-case";
import { UpdateAdvertisementReasonUseCase } from "src/application/use-cases/advertisement-reason/update-advertisement-reason.use-case";
import { CreateAdvertisementReportUseCase } from "src/application/use-cases/advertisement-report/create-advertisement-report.use-case";
import { DeleteAdvertisementReportUseCase } from "src/application/use-cases/advertisement-report/delete-advertisement-report.use-case";
import { GetByAdvertisementIdAdvertisementReportUseCase } from "src/application/use-cases/advertisement-report/get-by-advertisement-id-advertisement-report.use-case";
import { CreateFavoriteUserUseCase } from "src/application/use-cases/user/create-favorite-user.use-case";
import { CreateUserUseCase } from "src/application/use-cases/user/create-user.use-case";
import { DeleteFavoriteUserUseCase } from "src/application/use-cases/user/delete-favorite-user.use-case";
import { DeleteUserUseCase } from "src/application/use-cases/user/delete-user.use-case";
import { GetMeUserUseCase } from "src/application/use-cases/user/get-me-user.use-case";
import { GetFavoritesUserUseCase } from "src/application/use-cases/user/get-favorites-user.use-case";
import { LoginUserUseCase } from "src/application/use-cases/user/login-user.use-case";
import { PathUserUseCase } from "src/application/use-cases/user/path-user.use-case";
import { UpdateAllUserStatusUseCase } from "src/application/use-cases/user/update-all-user-status.use-case";
import { UpdateStatusUserUseCase } from "src/application/use-cases/user/update-status-user.use-case";
import { CreateAccountUseCase } from "src/application/use-cases/account/create-account.use-case";
import { DeleteImageAccountUseCase } from "src/application/use-cases/account/delete-image-account.use-case";
import { DeleteUserAccountUseCase } from "src/application/use-cases/account/delete-user-account.use-case";
import { FindInactivesAccountUseCase } from "src/application/use-cases/account/find-inactives-account.use-case";
import { GetAllAccountUseCase } from "src/application/use-cases/account/get-all-account.use-case";
import { GetByIdAccountUseCase } from "src/application/use-cases/account/get-by-id-account.use-case";
import { GetRegisteredAccountsUseCase } from "src/application/use-cases/account/get-registered-accounts.use-case";
import { PathAccountUseCase } from "src/application/use-cases/account/path-account.use-case";
import { ProcessImageAccountUseCase } from "src/application/use-cases/account/process-image-account.use-case";
import { UpdateStatusAccountUseCase } from "src/application/use-cases/account/update-status-account.use-case";
import { BulkAdvertisementUseCase } from "src/application/use-cases/advertisement/bulk-advertisement.use-case";
import { CreateAdvertisementUseCase } from "src/application/use-cases/advertisement/create-advertisement.use-case";
import { DeleteAllAdvertisementUseCase } from "src/application/use-cases/advertisement/delete-all-advertisement.use-case";
import { FindAllWithReportsAdvertisementUseCase } from "src/application/use-cases/advertisement/find-all-with-reports-advertisement.use-case";
import { FindSimilarDocumentsAdvertisementUseCase } from "src/application/use-cases/advertisement/find-similar-documents-advertisement.use-case";
import { GetActiveAdvertisementUseCase } from "src/application/use-cases/advertisement/get-active-advertisement.use-case";
import { GetActivesAdvertisementUseCase } from "src/application/use-cases/advertisement/get-actives-advertisement.use-case";
import { GetAllByAccountIdAdvertisementUseCase } from "src/application/use-cases/advertisement/get-all-by-account-id-advertisement.use-case";
import { GetAllToApproveAdvertisementUseCase } from "src/application/use-cases/advertisement/get-all-to-approve-advertisement.use-case";
import { GetByAccountIdAndIdAdvertisementUseCase } from "src/application/use-cases/advertisement/get-by-account-id-and-id-advertisement.use-case";
import { ProcessImagesAdvertisementUseCase } from "src/application/use-cases/advertisement/process-images-advertisement.use-case";
import { UpdateAdvertisementUseCase } from "src/application/use-cases/advertisement/update-advertisement.use-case";
import { UpdateStatusAllAdvertisementUseCase } from "src/application/use-cases/advertisement/update-status-all-advertisement.use-case";
import { DeleteImagesAdvertisementUseCase } from "src/application/use-cases/advertisement/delete-images-advertisement.use-case";
import { GetRegisteredAdvertisementsUseCase } from "src/application/use-cases/advertisement/get-registered-advertisements.use-case";
import { ContractTypeController } from "./controllers/contract-type.controller";
import { GetAllContractTypeUseCase } from "src/application/use-cases/contract-type/get-all-contract-type.use-case";
import { ContractTypeIsExistingIdConstraint } from "./validators/contract-type/contract-type-is-existing-id.validator";
import { CreateSubscriptionUseCase } from "src/application/use-cases/subscription/create-subscription.use-case";
import { SubscriptionController } from "./controllers/subscription.controller";
import { EPaycoService } from "../payment-gateway/epayco/epayco.service";
import { IPaymentGateway } from "src/application/interfaces/payment-gateway/payment-gateway.interface";
import { ReceiveSubscriptionNotificationUseCase } from "src/application/use-cases/subscription/receive-subscription-notification.use-case";
import { ReceiveSubscriptionInvoiceNotificationUseCase } from "src/application/use-cases/subscription/receive-subscription-invoice-notification.use-case";
import { ReceiveSubscriptionPaymentNotificationUseCase } from "src/application/use-cases/subscription/receive-subscription-payment-notification.use-case";
import { UpdateFirebaseUsersDataUseCase } from "src/application/use-cases/user/update-firebase-users-data.use-case";
import { CreateInternalSubscriptionUseCase } from "src/application/use-cases/subscription/create-internal-subscription.use-case";
import { CreateAdvertisementEventUseCase } from "src/application/use-cases/advertisement-event/create-advertisement-event.use-case";
import { AdvertisementEventController } from "./controllers/advertisement-event.controller";
import { AccountAlreadyExistsConstraint } from "./validators/account/account-already-exists.validator";
import { GetAllUserByAccountIdUseCase } from "src/application/use-cases/user/get-all-user-by-account-id.use-case";
import { UpdateImagesOrderAdvertisementUseCase } from "src/application/use-cases/advertisement/update-images-order-advertisement.use-case";
import { CreateUserMasterUseCase } from "src/application/use-cases/user/create-user-master.use-case";
import { TransferAdvertisementUseCase } from "src/application/use-cases/advertisement/transfer-advertisement.use-case";
import { GetAdvertisementLocationsUseCase } from "src/application/use-cases/advertisement/get-advertisement-locations.use-case";
import { NetworkService } from "src/application/use-cases/network/network.service";
import { NetworkController } from "./controllers/network.controller";
import { RemoveInternalSubscriptionUseCase } from "src/application/use-cases/subscription/remove-internal-subscription.use-case";
import { CancelSubscriptionOnPaymentGatewayUseCase } from "src/application/use-cases/subscription/cancel-subscription-on-payment-gateway.use-case";
import { UpdateSubscriptionPlanUseCase } from "src/application/use-cases/subscription/update-subscription-plan.use-case";
import { GetAccountAdvertisementStatisticsUseCase } from "src/application/use-cases/account-advertisement-statistic/get-account-advertisement-statistics.use-case";
import { GenerateAccountAdvertisementMonthlyStatisticsUseCase } from "src/application/use-cases/account-advertisement-statistic/generate-account-advertisement-monthly-statistics.use-case";
import { GetAdvertisementStatisticsUseCase } from "src/application/use-cases/advertisement-statistics/get-advertisement-statistics.use-case";
import { GenerateAdvertisementMonthlyStatisticsUseCase } from "src/application/use-cases/advertisement-statistics/generate-advertisement-monthly-statistics.use-case";
import { AdvertisementStatisticsController } from "./controllers/advertisement-statistics.controller";
import { ProcessCancelledSubscriptionsUseCase } from "src/application/use-cases/subscription/process-cancelled-subscriptions.use-case";
import { GetCurrentSubscriptionUseCase } from "src/application/use-cases/subscription/get-current-subscription.use-case";
import { GetSubscriptionHistoryUseCase } from "src/application/use-cases/subscription/get-subscription-history.use-case";
import { GetSubscriptionPaymentHistoryUseCase } from "src/application/use-cases/subscription/get-subscription-payment-history.use-case";
import { UpdateSubscriptionVipPlanUseCase } from "src/application/use-cases/subscription/update-subscription-vip-plan.use-case";
import { AdjustAdvertisementsAfterPlanChangeUseCase } from "src/application/use-cases/advertisement/adjust-advertisements-after-plan-change.use-case";
import { RedeemCouponUseCase } from "src/application/use-cases/coupon/redeem-coupon.use-case";
import { CouponController } from "./controllers/coupon.controller";
import { CreateCouponUseCase } from "src/application/use-cases/coupon/create-coupon.use-case";
import { ChangeCardSubscriptionUseCase } from "src/application/use-cases/subscription/change-card-subscription.use-case";
import { GetByAccountIdBillingUseCase } from "src/application/use-cases/billing/get-by-account-id-billing.use-case";
import { UpdateBillingUseCase } from "src/application/use-cases/billing/update-billing.use-case";
import { CreateBillingUseCase } from "src/application/use-cases/billing/create-billing.use-case";
import { UpdateCustomerSubscriptionUseCase } from "src/application/use-cases/subscription/update-customer-subscription.use-case";
import { GetCustomerSubscriptionUseCase } from "src/application/use-cases/subscription/get-customer-subscription.use-case";
import { ProcessCancelledSubscriptionsToDowngradeUseCase } from "src/application/use-cases/subscription/process-cancelled-subscriptions-to-downgrade.use-case";
import { CreateAccountEventUseCase } from "src/application/use-cases/account-event/create-account-event.use-case";
import { AccountEventController } from "./controllers/account-event.controller";

@Module({
    imports: [
        AlgoliaModule,
        OpenAiModule,
        CloudinaryModule,
    ],
    providers: [
        CreatePlanUseCase,
        GetAllPlanUseCase,
        CreateAccountUseCase,
        DeleteImageAccountUseCase,
        DeleteUserAccountUseCase,
        FindInactivesAccountUseCase,
        GetAllAccountUseCase,
        GetByIdAccountUseCase,
        GetRegisteredAccountsUseCase,
        PathAccountUseCase,
        ProcessImageAccountUseCase,
        UpdateStatusAccountUseCase,
        CreateAdvertisementReasonUseCase,
        DeleteAdvertisementReasonUseCase,
        GetAllAdvertisementReasonUseCase,
        UpdateAdvertisementReasonUseCase,
        CreateAdvertisementReportUseCase,
        DeleteAdvertisementReportUseCase,
        GetByAdvertisementIdAdvertisementReportUseCase,
        CreateAdvertisementEventUseCase,
        BulkAdvertisementUseCase,
        GetAdvertisementLocationsUseCase,
        CreateAdvertisementUseCase,
        DeleteAllAdvertisementUseCase,
        DeleteImagesAdvertisementUseCase,
        FindAllWithReportsAdvertisementUseCase,
        FindSimilarDocumentsAdvertisementUseCase,
        GetActiveAdvertisementUseCase,
        GetActivesAdvertisementUseCase,
        GetAllByAccountIdAdvertisementUseCase,
        GetAllToApproveAdvertisementUseCase,
        GetByAccountIdAndIdAdvertisementUseCase,
        GetRegisteredAdvertisementsUseCase,
        ProcessImagesAdvertisementUseCase,
        UpdateImagesOrderAdvertisementUseCase,
        UpdateAdvertisementUseCase,
        UpdateStatusAllAdvertisementUseCase,
        TransferAdvertisementUseCase,
        GetAllAmenityUseCase,
        UpdateBulkUpdateDateUseCase,
        CreateFavoriteUserUseCase,
        CreateUserUseCase,
        CreateUserMasterUseCase,
        DeleteFavoriteUserUseCase,
        DeleteUserUseCase,
        GetAllUserByAccountIdUseCase,
        GetMeUserUseCase,
        GetFavoritesUserUseCase,
        LoginUserUseCase,
        PathUserUseCase,
        UpdateAllUserStatusUseCase,
        UpdateStatusUserUseCase,
        GetAllContractTypeUseCase,
        CreateSubscriptionUseCase,
        RemoveInternalSubscriptionUseCase,
        CancelSubscriptionOnPaymentGatewayUseCase,
        UpdateSubscriptionPlanUseCase,
        ReceiveSubscriptionNotificationUseCase,
        ReceiveSubscriptionPaymentNotificationUseCase,
        ReceiveSubscriptionInvoiceNotificationUseCase,
        UpdateFirebaseUsersDataUseCase,
        CreateInternalSubscriptionUseCase,
        GetAccountAdvertisementStatisticsUseCase,
        GenerateAccountAdvertisementMonthlyStatisticsUseCase,
        GetAdvertisementStatisticsUseCase,
        GenerateAdvertisementMonthlyStatisticsUseCase,
        ProcessCancelledSubscriptionsUseCase,
        GetCurrentSubscriptionUseCase,
        GetSubscriptionHistoryUseCase,
        GetSubscriptionPaymentHistoryUseCase,
        UpdateSubscriptionVipPlanUseCase,
        AdjustAdvertisementsAfterPlanChangeUseCase,
        RedeemCouponUseCase,
        IsExistingAdvertisementReasonConstraint,
        AmenityIsExistingIdConstraint,
        ContractTypeIsExistingIdConstraint,
        IsExistingPlanConstraint,
        UserAlreadyExistsConstraint,
        AccountAlreadyExistsConstraint,
        CreateCouponUseCase,
        ChangeCardSubscriptionUseCase,
        CreateBillingUseCase,
        UpdateBillingUseCase,
        GetByAccountIdBillingUseCase,
        UpdateCustomerSubscriptionUseCase,
        GetCustomerSubscriptionUseCase,
        ProcessCancelledSubscriptionsToDowngradeUseCase,
        CreateAccountEventUseCase,
        FirebaseAdmin,
        {
            provide: IPaymentGateway,
            useClass: EPaycoService,
        },
        NetworkService,
        RedisService,
        RedisCacheInterceptor,
    ],
    controllers: [
        AccountController,
        AdvertisementEventController,
        AdvertisementReasonController,
        AdvertisementReportController,
        AdvertisementController,
        AmenityController,
        PlanController,
        UserController,
        ContractTypeController,
        SubscriptionController,
        NetworkController,
        AdvertisementStatisticsController,
        CouponController,
        AccountEventController,
        ],
})
export class HttpModule {}