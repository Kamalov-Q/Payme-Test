import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymeAuthService {
    validate(auth: string) {
        if (!auth) return false;

        const decoded = Buffer.from(auth.replace('Basic ', ''),
            'base64',).toString();

        return decoded === `Payme:${process.env.PAYME_KEY}`;
    }
}