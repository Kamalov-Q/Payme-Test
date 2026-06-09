import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column('bigint')
    amount: number;

    @Column({
        default: 'PENDING',
    })
    status: 'PENDING' | 'PAID' | 'CANCELLED';
}