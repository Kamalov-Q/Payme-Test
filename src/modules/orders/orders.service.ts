import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { PaymeService } from "../payme/payme.service";

@Injectable()
export class OrdersService {
    constructor(private repo: Repository<Order>,
        private readonly paymeSvc: PaymeService
    ) { }

    create(productId: number, amount: number) {
        return this.repo.save({
            productId,
            amount,
            status: 'PENDING'
        });
    }

    findOne(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    markPaid(id: number) {
        return this.repo.update(id, { status: 'PAID' });
    }

    cancel(id: number) {
        return this.repo.update(id, { status: 'CANCELLED' });
    }

}