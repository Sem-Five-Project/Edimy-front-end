import api from "./api";

export interface Payment {
    paymentId: string;
    studentId: number;
    amount: number;
    paymentMethod: string;
    paymentType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'CASH';
    paymentStatus: 'SUCCESS' | 'FAILED' | 'ROLLBACKED_PENDING_ADMIN' | 'PENDING' | 'REFUNDED';
    paymentTime?: string;
    availabilityId?: number;
    cardHolderName?: string;
    classId?: number;
    completedAt?: string;
    createdAt?: string;
    currency?: string;
    expiresAt?: string;
    orderId: string;
    payherePaymentId?: string;
    slotId?: number;
    status?: string;
    tutorId?: number;
}

export interface GetAllPaymentsResponse {
    success: boolean;
    count: number;
    payments: Payment[];
}

export interface ErrorResponse {
    success: false;
    message: string;
}

export const getAllPayments = async (): Promise<GetAllPaymentsResponse> => {
    const response = await api.get('/api/payments/all');
    return response.data;
};