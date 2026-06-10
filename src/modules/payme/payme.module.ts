import { Module } from "@nestjs/common";
import { PaymeService } from "./payme.service";
import { PaymeAuthService } from "./payme-auth.service";
import { PaymeController } from "./payme.controller";
import { ConfigModule } from "@nestjs/config";


@Module({
    imports: [ConfigModule],
    providers: [PaymeService, PaymeAuthService],
    controllers: [PaymeController],
    exports: [PaymeService]
})
export class PaymeModule { }