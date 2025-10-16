import api from "./api";

export interface Payment {
    paymentId: string;
    studentId: number;
    amount: number;
    paymentMethod: string;
    paymentType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'CASH' | null;
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
    try {
        const response = await api.get('/payment/all');
        
        // Handle different response structures
        if (response.data?.success !== undefined) {
            // Response already in correct format
            return response.data;
        }
        
        // Transform if response is just an array
        if (Array.isArray(response.data)) {
            return {
                success: true,
                count: response.data.length,
                payments: response.data
            };
        }
        
        // If response has payments array directly
        if (response.data?.payments) {
            return {
                success: true,
                count: response.data.count || response.data.payments.length,
                payments: response.data.payments
            };
        }
        
        // Fallback
        return response.data;
    } catch (error: any) {
        console.error('getAllPayments error:', error);
        
        // Provide helpful error message
        if (error.response?.status === 500) {
            throw new Error('Backend server error. Please check if the /api/payments/all endpoint is implemented and the database is accessible.');
        }
        
        if (error.response?.status === 404) {
            throw new Error('Payment endpoint not found. Please verify the backend has the /api/payments/all route.');
        }
        
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payments');
    }
};