// Payment Management Data Layer

export type TransactionStatus = 'Paid' | 'Pending' | 'Refunded' | 'Failed' | 'Processing';
export type TransactionType = 'session_payment' | 'refund' | 'adjustment' | 'commission' | 'fee';
export type PayoutStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'On Hold';
export type DisputeStatus = 'Open' | 'Resolved' | 'Escalated' | 'Closed';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'wallet';

export interface TransactionData {
  id: string;
  sessionId?: string;
  studentId: string;
  tutorId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  commission: number;
  netAmount: number; // Amount after commission
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  processedDate?: string;
  description: string;
  notes?: string;
  refundAmount?: number;
  refundReason?: string;
  paymentGatewayId: string;
  platformFee: number;
  metadata: {
    sessionTitle?: string;
    subject?: string;
    duration?: number;
    originalTransactionId?: string; // For refunds
  };
}

export interface PayoutRequest {
  id: string;
  tutorId: string;
  tutor: {
    id: string;
    name: string;
    email: string;
    bankDetails?: {
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
  };
  amount: number;
  currency: string;
  status: PayoutStatus;
  requestedDate: string;
  processedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  paymentMethod: PaymentMethod;
  transactionIds: string[]; // Associated transactions
  notes?: string;
  estimatedProcessingTime: string;
  actualProcessingTime?: string;
}

export interface PaymentDispute {
  id: string;
  transactionId: string;
  sessionId?: string;
  studentId: string;
  tutorId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  disputeType: 'refund_request' | 'service_issue' | 'billing_error' | 'fraud_claim' | 'quality_issue';
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: string;
  resolvedDate?: string;
  resolvedBy?: string;
  description: string;
  evidence: {
    studentEvidence?: string[];
    tutorEvidence?: string[];
    adminNotes?: string[];
  };
  resolution?: {
    action: 'refund_approved' | 'refund_denied' | 'partial_refund' | 'escalated';
    amount?: number;
    reasoning: string;
    compensationOffered?: string;
  };
  timeline: {
    timestamp: string;
    action: string;
    performedBy: string;
    details: string;
  }[];
}

export interface PricingPolicy {
  id: string;
  name: string;
  description: string;
  category: 'commission' | 'platform_fee' | 'discount' | 'transaction_fee';
  rateType: 'percentage' | 'fixed' | 'tiered';
  rate: number;
  isActive: boolean;
  validUntil?: string;
  monthlyRevenue?: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface FinancialReport {
  id: string;
  type: 'revenue_overview' | 'commission_analysis' | 'tutor_performance' | 'payment_insights';
  title: string;
  period: string;
  generatedDate: string;
  metrics: {
    totalRevenue: number;
    revenueGrowth: number;
    commissionEarned: number;
    commissionGrowth: number;
    totalTransactions: number;
    transactionGrowth: number;
    averageOrderValue: number;
    aovGrowth: number;
  };
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
    description: string;
  }[];
}

export interface FinancialReportData {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  totalRefunds: number;
  netRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  topTutorsByRevenue: {
    tutorId: string;
    tutorName: string;
    revenue: number;
    sessionCount: number;
  }[];
  revenueBySubject: {
    subject: string;
    revenue: number;
    sessionCount: number;
  }[];
  paymentMethodDistribution: {
    method: PaymentMethod;
    count: number;
    totalAmount: number;
  }[];
  monthlyTrends: {
    month: string;
    revenue: number;
    transactions: number;
    refunds: number;
  }[];
}

export interface TransactionFilters {
  studentName?: string;
  tutorName?: string;
  transactionId?: string;
  sessionId?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface PayoutFilters {
  tutorName?: string;
  status?: PayoutStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface DisputeFilters {
  studentName?: string;
  tutorName?: string;
  disputeType?: PaymentDispute['disputeType'];
  status?: DisputeStatus;
  priority?: PaymentDispute['priority'];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Mock data generators
const generateTransactionId = () => `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generatePayoutId = () => `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateDisputeId = () => `DIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const mockStudents = [
  { id: 'std-001', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'std-002', name: 'Bob Smith', email: 'bob@example.com' },
  { id: 'std-003', name: 'Carol Williams', email: 'carol@example.com' },
  { id: 'std-004', name: 'David Brown', email: 'david@example.com' },
  { id: 'std-005', name: 'Emma Davis', email: 'emma@example.com' },
];

const mockTutors = [
  { id: 'tut-001', name: 'Dr. Sarah Wilson', email: 'sarah@example.com' },
  { id: 'tut-002', name: 'Prof. Michael Chen', email: 'michael@example.com' },
  { id: 'tut-003', name: 'Dr. Lisa Garcia', email: 'lisa@example.com' },
  { id: 'tut-004', name: 'Prof. James Miller', email: 'james@example.com' },
  { id: 'tut-005', name: 'Dr. Anna Taylor', email: 'anna@example.com' },
];

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History'];
const paymentMethods: PaymentMethod[] = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
const transactionTypes: TransactionType[] = ['session_payment', 'refund', 'adjustment', 'commission'];

// Generate mock transactions
export const generateMockTransactions = (count: number = 100): TransactionData[] => {
  const transactions: TransactionData[] = [];
  
  for (let i = 0; i < count; i++) {
    const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const tutor = mockTutors[Math.floor(Math.random() * mockTutors.length)];
    const amount = Math.floor(Math.random() * 200) + 20; // $20-$220
    const commission = amount * 0.15; // 15% commission
    const platformFee = amount * 0.03; // 3% platform fee
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    
    const transaction: TransactionData = {
      id: generateTransactionId(),
      sessionId: `SES-${Math.floor(Math.random() * 10000)}`,
      studentId: student.id,
      tutorId: tutor.id,
      student,
      tutor,
      amount,
      commission,
      netAmount: amount - commission - platformFee,
      currency: 'USD',
      status: ['Paid', 'Pending', 'Refunded'][Math.floor(Math.random() * 3)] as TransactionStatus,
      type,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      transactionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      processedDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      description: `Payment for ${subjects[Math.floor(Math.random() * subjects.length)]} session`,
      paymentGatewayId: `stripe_${Math.random().toString(36).substr(2, 9)}`,
      platformFee,
      metadata: {
        sessionTitle: `${subjects[Math.floor(Math.random() * subjects.length)]} Tutoring`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)]
      }
    };
    
    if (type === 'refund') {
      transaction.refundAmount = amount * (0.5 + Math.random() * 0.5); // 50-100% refund
      transaction.refundReason = ['Student cancellation', 'Technical issues', 'Quality concerns'][Math.floor(Math.random() * 3)];
    }
    
    transactions.push(transaction);
  }
  
  return transactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
};

// Generate mock payouts
export const generateMockPayouts = (count: number = 50): PayoutRequest[] => {
  const payouts: PayoutRequest[] = [];
  
  for (let i = 0; i < count; i++) {
    const tutor = mockTutors[Math.floor(Math.random() * mockTutors.length)];
    const amount = Math.floor(Math.random() * 2000) + 100; // $100-$2100
    
    payouts.push({
      id: generatePayoutId(),
      tutorId: tutor.id,
      tutor: {
        ...tutor,
        bankDetails: {
          accountNumber: `****${Math.floor(Math.random() * 10000)}`,
          routingNumber: `${Math.floor(Math.random() * 1000000000)}`,
          bankName: ['Chase Bank', 'Wells Fargo', 'Bank of America'][Math.floor(Math.random() * 3)]
        }
      },
      amount,
      currency: 'USD',
      status: ['Pending', 'Approved', 'Paid', 'On Hold'][Math.floor(Math.random() * 4)] as PayoutStatus,
      requestedDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      processedDate: Math.random() > 0.4 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      transactionIds: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => generateTransactionId()),
      estimatedProcessingTime: '3-5 business days',
      notes: Math.random() > 0.7 ? 'Regular payout request' : undefined
    });
  }
  
  return payouts.sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
};

// Generate mock disputes
export const generateMockDisputes = (count: number = 25): PaymentDispute[] => {
  const disputes: PaymentDispute[] = [];
  const disputeTypes: PaymentDispute['disputeType'][] = ['refund_request', 'service_issue', 'billing_error', 'fraud_claim', 'quality_issue'];
  
  for (let i = 0; i < count; i++) {
    const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const tutor = mockTutors[Math.floor(Math.random() * mockTutors.length)];
    const amount = Math.floor(Math.random() * 200) + 20;
    
    disputes.push({
      id: generateDisputeId(),
      transactionId: generateTransactionId(),
      sessionId: `SES-${Math.floor(Math.random() * 10000)}`,
      studentId: student.id,
      tutorId: tutor.id,
      student,
      tutor,
      amount,
      disputeType: disputeTypes[Math.floor(Math.random() * disputeTypes.length)],
      status: ['Open', 'Resolved', 'Escalated'][Math.floor(Math.random() * 3)] as DisputeStatus,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as PaymentDispute['priority'],
      createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      description: 'Student reported issues with session quality and is requesting a refund.',
      evidence: {
        studentEvidence: ['Session recording shows technical difficulties'],
        tutorEvidence: ['Provided makeup session offer'],
        adminNotes: ['Reviewing case based on platform policies']
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          action: 'Dispute Created',
          performedBy: student.name,
          details: 'Initial dispute submission'
        }
      ]
    });
  }
  
  return disputes.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
};

// API Functions
export const getTransactions = async (filters: TransactionFilters = {}): Promise<{
  transactions: TransactionData[];
  total: number;
  stats: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    refundedAmount: number;
  };
}> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  let transactions = generateMockTransactions(150);
  
  // Apply filters
  if (filters.studentName) {
    transactions = transactions.filter(t => 
      t.student.name.toLowerCase().includes(filters.studentName!.toLowerCase())
    );
  }
  
  if (filters.tutorName) {
    transactions = transactions.filter(t => 
      t.tutor.name.toLowerCase().includes(filters.tutorName!.toLowerCase())
    );
  }
  
  if (filters.status) {
    transactions = transactions.filter(t => t.status === filters.status);
  }
  
  if (filters.type) {
    transactions = transactions.filter(t => t.type === filters.type);
  }
  
  if (filters.dateFrom) {
    transactions = transactions.filter(t => t.transactionDate >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    transactions = transactions.filter(t => t.transactionDate <= filters.dateTo!);
  }
  
  // Calculate stats
  const stats = {
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    paidAmount: transactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0),
    pendingAmount: transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0),
    refundedAmount: transactions.filter(t => t.status === 'Refunded').reduce((sum, t) => sum + (t.refundAmount || 0), 0)
  };
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + limit);
  
  return {
    transactions: paginatedTransactions,
    total: transactions.length,
    stats
  };
};

export const getPayouts = async (filters: PayoutFilters = {}): Promise<{
  payouts: PayoutRequest[];
  total: number;
  stats: {
    totalRequested: number;
    pendingAmount: number;
    approvedAmount: number;
    paidAmount: number;
  };
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let payouts = generateMockPayouts(75);
  
  // Apply filters
  if (filters.tutorName) {
    payouts = payouts.filter(p => 
      p.tutor.name.toLowerCase().includes(filters.tutorName!.toLowerCase())
    );
  }
  
  if (filters.status) {
    payouts = payouts.filter(p => p.status === filters.status);
  }
  
  if (filters.dateFrom) {
    payouts = payouts.filter(p => p.requestedDate >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    payouts = payouts.filter(p => p.requestedDate <= filters.dateTo!);
  }
  
  const stats = {
    totalRequested: payouts.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payouts.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0),
    approvedAmount: payouts.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
  };
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedPayouts = payouts.slice(startIndex, startIndex + limit);
  
  return {
    payouts: paginatedPayouts,
    total: payouts.length,
    stats
  };
};

export const getDisputes = async (filters: DisputeFilters = {}): Promise<{
  disputes: PaymentDispute[];
  total: number;
  stats: {
    openDisputes: number;
    resolvedDisputes: number;
    totalDisputedAmount: number;
    averageResolutionTime: number;
  };
}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let disputes = generateMockDisputes(40);
  
  // Apply filters similar to above
  if (filters.status) {
    disputes = disputes.filter(d => d.status === filters.status);
  }
  
  if (filters.priority) {
    disputes = disputes.filter(d => d.priority === filters.priority);
  }
  
  const stats = {
    openDisputes: disputes.filter(d => d.status === 'Open').length,
    resolvedDisputes: disputes.filter(d => d.status === 'Resolved').length,
    totalDisputedAmount: disputes.reduce((sum, d) => sum + d.amount, 0),
    averageResolutionTime: 3.5 // days
  };
  
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const paginatedDisputes = disputes.slice(startIndex, startIndex + limit);
  
  return {
    disputes: paginatedDisputes,
    total: disputes.length,
    stats
  };
};

// Action functions
export const updateTransactionStatus = async (
  transactionId: string,
  status: TransactionStatus,
  notes?: string
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Updated transaction ${transactionId} to ${status}`, notes);
  return true;
};

export const processRefund = async (
  transactionId: string,
  amount: number,
  reason: string
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`Processed refund of $${amount} for transaction ${transactionId}: ${reason}`);
  return true;
};

export const approvePayout = async (
  payoutId: string,
  adminId: string
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Payout ${payoutId} approved by ${adminId}`);
  return true;
};

export const resolveDispute = async (
  disputeId: string,
  resolution: PaymentDispute['resolution'],
  adminId: string
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log(`Dispute ${disputeId} resolved by ${adminId}:`, resolution);
  return true;
};

export const exportTransactions = async (filters: TransactionFilters = {}): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const { transactions } = await getTransactions(filters);
  
  const headers = [
    'Transaction ID',
    'Date',
    'Student',
    'Tutor',
    'Amount',
    'Status',
    'Type',
    'Payment Method',
    'Commission',
    'Net Amount'
  ];
  
  const rows = transactions.map(t => [
    t.id,
    new Date(t.transactionDate).toLocaleDateString(),
    t.student.name,
    t.tutor.name,
    t.amount.toString(),
    t.status,
    t.type,
    t.paymentMethod,
    t.commission.toString(),
    t.netAmount.toString()
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const getFinancialReport = async (
  dateFrom: string,
  dateTo: string
): Promise<FinancialReportData> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const transactions = generateMockTransactions(200);
  const filteredTransactions = transactions.filter(t => 
    t.transactionDate >= dateFrom && t.transactionDate <= dateTo
  );
  
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = filteredTransactions.reduce((sum, t) => sum + t.commission, 0);
  const totalRefunds = filteredTransactions
    .filter(t => t.status === 'Refunded')
    .reduce((sum, t) => sum + (t.refundAmount || 0), 0);
  
  return {
    totalRevenue,
    totalCommission,
    totalPayouts: totalRevenue - totalCommission,
    totalRefunds,
    netRevenue: totalRevenue - totalRefunds,
    transactionCount: filteredTransactions.length,
    averageTransactionValue: totalRevenue / filteredTransactions.length,
    topTutorsByRevenue: mockTutors.slice(0, 5).map((tutor, index) => ({
      tutorId: tutor.id,
      tutorName: tutor.name,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      sessionCount: Math.floor(Math.random() * 50) + 10
    })),
    revenueBySubject: subjects.map(subject => ({
      subject,
      revenue: Math.floor(Math.random() * 3000) + 500,
      sessionCount: Math.floor(Math.random() * 30) + 5
    })),
    paymentMethodDistribution: paymentMethods.map(method => ({
      method,
      count: Math.floor(Math.random() * 50) + 10,
      totalAmount: Math.floor(Math.random() * 10000) + 1000
    })),
    monthlyTrends: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.floor(Math.random() * 15000) + 5000,
      transactions: Math.floor(Math.random() * 200) + 50,
      refunds: Math.floor(Math.random() * 10) + 1
    }))
  };
};

export const getPricingPolicies = async (): Promise<PricingPolicy[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockPolicies: PricingPolicy[] = [
    {
      id: 'policy-commission-001',
      name: 'Platform Commission',
      description: 'Standard commission rate for tutor sessions',
      category: 'commission',
      rateType: 'percentage',
      rate: 15,
      isActive: true,
      createdBy: 'admin-001',
      createdDate: '2024-01-01',
      lastModified: '2024-09-01',
      monthlyRevenue: 12500
    },
    {
      id: 'policy-platform-001',
      name: 'Platform Service Fee',
      description: 'Fixed fee charged per transaction',
      category: 'platform_fee',
      rateType: 'fixed',
      rate: 3,
      isActive: true,
      createdBy: 'admin-001',
      createdDate: '2024-01-01',
      lastModified: '2024-08-15',
      monthlyRevenue: 2100
    },
    {
      id: 'policy-discount-001',
      name: 'Student Discount',
      description: 'New student discount program',
      category: 'discount',
      rateType: 'percentage',
      rate: 10,
      isActive: true,
      validUntil: '2024-12-31',
      createdBy: 'admin-001',
      createdDate: '2024-06-01',
      lastModified: '2024-09-01'
    },
    {
      id: 'policy-transaction-001',
      name: 'Transaction Processing Fee',
      description: 'Payment gateway processing fee',
      category: 'transaction_fee',
      rateType: 'percentage',
      rate: 2.9,
      isActive: true,
      createdBy: 'admin-001',
      createdDate: '2024-01-01',
      lastModified: '2024-07-20',
      monthlyRevenue: 890
    },
    {
      id: 'policy-premium-001',
      name: 'Premium Subject Commission',
      description: 'Higher commission for premium subjects',
      category: 'commission',
      rateType: 'percentage',
      rate: 20,
      isActive: false,
      createdBy: 'admin-001',
      createdDate: '2024-03-01',
      lastModified: '2024-08-01'
    }
  ];
  
  return mockPolicies;
};

export const updatePricingPolicy = async (
  policyId: string, 
  updates: Partial<PricingPolicy>
): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Updated pricing policy ${policyId}:`, updates);
  return true;
};

export const getFinancialReports = async (period: string): Promise<FinancialReport[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockReports: FinancialReport[] = [
    {
      id: 'report-revenue-001',
      type: 'revenue_overview',
      title: 'Revenue Overview',
      period,
      generatedDate: new Date().toISOString(),
      metrics: {
        totalRevenue: 125000,
        revenueGrowth: 15.2,
        commissionEarned: 18750,
        commissionGrowth: 12.8,
        totalTransactions: 1240,
        transactionGrowth: 8.5,
        averageOrderValue: 100.8,
        aovGrowth: 6.2
      },
      breakdown: [
        {
          category: 'Session Payments',
          amount: 95000,
          percentage: 76,
          description: 'Revenue from tutoring sessions'
        },
        {
          category: 'Platform Fees',
          amount: 18750,
          percentage: 15,
          description: 'Commission and service fees'
        },
        {
          category: 'Premium Services',
          amount: 8500,
          percentage: 7,
          description: 'Additional premium features'
        },
        {
          category: 'Other',
          amount: 2750,
          percentage: 2,
          description: 'Miscellaneous revenue'
        }
      ]
    },
    {
      id: 'report-commission-001',
      type: 'commission_analysis',
      title: 'Commission Analysis',
      period,
      generatedDate: new Date().toISOString(),
      metrics: {
        totalRevenue: 125000,
        revenueGrowth: 15.2,
        commissionEarned: 18750,
        commissionGrowth: 12.8,
        totalTransactions: 1240,
        transactionGrowth: 8.5,
        averageOrderValue: 100.8,
        aovGrowth: 6.2
      },
      breakdown: [
        {
          category: 'Standard Commission (15%)',
          amount: 14250,
          percentage: 76,
          description: 'Regular tutor commission'
        },
        {
          category: 'Premium Commission (20%)',
          amount: 3200,
          percentage: 17,
          description: 'Premium subject commission'
        },
        {
          category: 'Bonus Commission',
          amount: 1300,
          percentage: 7,
          description: 'Performance-based bonuses'
        }
      ]
    },
    {
      id: 'report-tutor-001',
      type: 'tutor_performance',
      title: 'Tutor Performance',
      period,
      generatedDate: new Date().toISOString(),
      metrics: {
        totalRevenue: 125000,
        revenueGrowth: 15.2,
        commissionEarned: 18750,
        commissionGrowth: 12.8,
        totalTransactions: 1240,
        transactionGrowth: 8.5,
        averageOrderValue: 100.8,
        aovGrowth: 6.2
      },
      breakdown: [
        {
          category: 'Top 10% Tutors',
          amount: 45000,
          percentage: 36,
          description: 'Revenue from highest performing tutors'
        },
        {
          category: 'Mid-tier Tutors',
          amount: 60000,
          percentage: 48,
          description: 'Revenue from average performing tutors'
        },
        {
          category: 'New Tutors',
          amount: 20000,
          percentage: 16,
          description: 'Revenue from newly joined tutors'
        }
      ]
    },
    {
      id: 'report-payment-001',
      type: 'payment_insights',
      title: 'Payment Insights',
      period,
      generatedDate: new Date().toISOString(),
      metrics: {
        totalRevenue: 125000,
        revenueGrowth: 15.2,
        commissionEarned: 18750,
        commissionGrowth: 12.8,
        totalTransactions: 1240,
        transactionGrowth: 8.5,
        averageOrderValue: 100.8,
        aovGrowth: 6.2
      },
      breakdown: [
        {
          category: 'Credit Cards',
          amount: 75000,
          percentage: 60,
          description: 'Credit card payments'
        },
        {
          category: 'PayPal',
          amount: 31250,
          percentage: 25,
          description: 'PayPal payments'
        },
        {
          category: 'Bank Transfer',
          amount: 12500,
          percentage: 10,
          description: 'Direct bank transfers'
        },
        {
          category: 'Digital Wallet',
          amount: 6250,
          percentage: 5,
          description: 'Digital wallet payments'
        }
      ]
    }
  ];
  
  return mockReports;
};
