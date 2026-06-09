import { Module } from "@nestjs/common";
import { PaymeService } from "./payme.service";
import { PaymeAuthService } from "./payme-auth.service";
import { PaymeController } from "./payme.controller";


@Module({
    providers: [PaymeService, PaymeAuthService],
    controllers: [PaymeController]
})
export class PaymeModule { }