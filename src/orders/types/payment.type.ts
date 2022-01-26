import { PaymentStatus } from '../enums/payment-status.enum';

export class Payment {
    status: PaymentStatus;
    transactionId: string;
    amount: number;
}
