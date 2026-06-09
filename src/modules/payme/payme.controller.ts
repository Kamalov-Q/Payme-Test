import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { PaymeService } from "./payme.service";
import type { Request } from "express";


@Controller('payme')
export class PaymeController {
    constructor(private paymeSvc: PaymeService) { }

    @Post()
    async rpc(@Req() req: Request, @Body() body: any) {
        const auth = req.headers.authorization;

        if (!auth) throw new UnauthorizedException();

        return this.paymeSvc.handle(body);
    }

}