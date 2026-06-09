import { Injectable } from "@nestjs/common";
import { OrdersService } from "../orders/orders.service";
import { Repository } from "typeorm";
import { PaymeTransaction } from "./entities/payme-transaction.entity";
import { PaymeException } from "src/exceptions/payme.exception";

@Injectable()
export class PaymeService {
    constructor(
        private orders: OrdersService,
        private txRepo: Repository<PaymeTransaction>
    ) { }

    async handle(body: any) {
        const { method, params, id } = body;
        let result;

        // switch (method) {
        //     case 'CheckPerformTransaction':
        // }



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

}