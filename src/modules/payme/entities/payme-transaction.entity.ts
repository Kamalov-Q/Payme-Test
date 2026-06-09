import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('payme_transactions')
export class PaymeTransaction {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ unique: true })
    paymentTransactionId: string;

    @Column()
    orderId: string;

    @Column('bigint')
    amount: number;

    @Column()
    state: number;

    @Column({ nullable: true })
    reason: number;

    @Column({ type: 'bigint' })
    createTime: number;

    @Column({ type: 'bigint', nullable: true })
    performTime: number;

    @Column({ type: 'bigint', nullable: true })
    cancelTime: number;

    @CreateDateColumn()
    createdAt: Date;
}