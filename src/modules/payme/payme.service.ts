import { Injectable } from "@nestjs/common";
import { OrdersService } from "../orders/orders.service";
import { Repository } from "typeorm";
import { PaymeTransaction } from "./entities/payme-transaction.entity";
import { PaymeException } from "src/exceptions/payme.exception";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PaymeService {
    constructor(
        private configSvc: ConfigService,
        private orders: OrdersService,
        private txRepo: Repository<PaymeTransaction>,
    ) { }

    async handle(body: any) {
        const { method, params, id } = body;
        let result;

        switch (method) {
            case 'CheckPerformTransaction':
                result = await this.check(params);
                break;

            case 'CreateTransaction':
                result = await this.create(params);
                break;

            case 'PerformTransaction':
                result = await this.perform(params);
                break;

            case 'CancelTransaction':
                result = await this.cancel(params);
                break;

            case 'CheckTransaction':
                result = await this.checkTx(params);
                break;

            case 'GetStatement':
                result = await this.statement();

            default:
                return {
                    error: { code: -32601 }
                };
        }

        return { id, result }



    }

    async check(params: any) {
        const order = await this.orders.findOne(params.account.orderId);

        if (!order) throw new PaymeException(-31050, 'Order not found!');

        if (order.status === 'PAID') {
            throw new PaymeException(-31008, 'Already paid');
        }

        if (order.amount !== params.amount) {
            throw new PaymeException(-31001, 'Invalid amount');
        }

        return { allow: true }
    }

    async create(params: any) {
        let tx = await this.txRepo.findOne({
            where: { paymentTransactionId: params.id },
        });

        if (tx) {
            return {
                create_time: tx.createTime,
                transaction: tx.id.toString(),
                state: tx.state
            };
        }

        const order = await this.orders.findOne(params.account.orderId);

        tx = await this.txRepo.save({
            paymentTransactionId: params.id,
            orderId: String(order?.id),
            amount: params.amount,
            state: 1,
            createTime: Date.now(),
        });

        return {
            create_time: tx.createTime,
            transaction: tx.id.toString(),
            state: 1
        }
    }

    async perform(params: any) {
        const tx = await this.txRepo.findOne({
            where: { paymentTransactionId: params.id }
        });

        if (!tx) throw new PaymeException(-31003, 'Not found');

        if (tx.state === 2) {
            return {
                transaction: tx.id.toString(),
                perform_time: tx.performTime,
                state: 2
            };
        }

        tx.state = 2;
        tx.performTime = Date.now();

        await this.txRepo.save(tx);

        await this.orders.markPaid(Number(tx.orderId));

        return {
            transaction: tx.id.toString(),
            perform_time: tx.performTime,
            state: 2
        }
    }

    async cancel(params: any) {
        const tx = await this.txRepo.findOne({
            where: { paymentTransactionId: params.id }
        });

        if (!tx) throw new PaymeException(-31003, 'Not found');

        tx.state = tx.state === 2 ? -2 : -1;
        tx.cancelTime = Date.now();
        tx.reason = params.reason;

        await this.txRepo.save(tx);

        await this.orders.cancel(Number(tx.orderId));


        return {
            transaction: tx.id.toString(),
            cancel_time: tx.cancelTime,
            state: tx.state
        }
    }

    async checkTx(params: any) {
        const tx = await this.txRepo.findOne({
            where: { paymentTransactionId: params.id }
        });

        return {
            create_time: tx?.createTime,
            perform_time: tx?.performTime,
            cancel_time: tx?.cancelTime,
            transaction: tx?.id.toString(),
            state: tx?.state,
            reason: tx?.reason || null
        };
    }

    async statement() {
        const txs = await this.txRepo.find();

        return {
            transactions: txs
        }
    }

    async generateCheckoutLink(
        orderId: number,
        amount: number
    ): Promise<string> {
        const merchantId = this.configSvc.get<string>('payme.merchantId');

        const checkoutUrl = this.configSvc.get<string>('payme.checkoutUrl');

        /**
        * Payme requires:
        * m  -> merchant id
        * ac -> account object
        * a  -> amount
        */

        const payload = {
            m: merchantId,
            ac: {
                orderId,
            },
            a: amount * 100     //  Payme uses "tiyin" so 1 so'm = 100 tiyin
        };

        const encoded = Buffer.from(JSON.stringify(payload),).toString('base64');

        return `${checkoutUrl}/${encoded}`;
    }

}