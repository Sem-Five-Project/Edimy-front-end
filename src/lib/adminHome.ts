/*
{
    "totalSessions": 24,
    "sessionGainPercentage": 12.5,
    "totalProfit": 2500000,
    "sessionProfitGainPercentage": 8.3,
    "totalSubjects": 3,
    "subjectGainPercentage": 4.7,
    "totalUsers": 27,
    "userGainPercentage": 3.2,
    "monthlyPaymentsForLastYear": [
        {
            "monthOrYear": 1,
            "totalPayments": 21000.0
        },
        {
            "monthOrYear": 2,
            "totalPayments": 25000.0
        },
        {
            "monthOrYear": 3,
            "totalPayments": 23000.0
        },
        {
            "monthOrYear": 4,
            "totalPayments": 22000.0
        },
        {
            "monthOrYear": 5,
            "totalPayments": 24000.0
        },
        {
            "monthOrYear": 6,
            "totalPayments": 26000.0
        },
        {
            "monthOrYear": 7,
            "totalPayments": 27000.0
        },
        {
            "monthOrYear": 8,
            "totalPayments": 28000.0
        },
        {
            "monthOrYear": 9,
            "totalPayments": 30000.0
        },
        {
            "monthOrYear": 10,
            "totalPayments": 31000.0
        },
        {
            "monthOrYear": 11,
            "totalPayments": 32000.0
        },
        {
            "monthOrYear": 12,
            "totalPayments": 33000.0
        }
    ],
    "yearlyPayments": [
        {
            "monthOrYear": 2022,
            "totalPayments": 240000.0
        },
        {
            "monthOrYear": 2023,
            "totalPayments": 280000.0
        },
        {
            "monthOrYear": 2024,
            "totalPayments": 300000.0
        }
    ],
    "sessionsThisWeek": [
        {
            "day": "Mon",
            "completedSessionCount": 18,
            "cancelledSessionCount": 2
        },
        {
            "day": "Tue",
            "completedSessionCount": 16,
            "cancelledSessionCount": 2
        },
        {
            "day": "Wed",
            "completedSessionCount": 20,
            "cancelledSessionCount": 2
        },
        {
            "day": "Thu",
            "completedSessionCount": 23,
            "cancelledSessionCount": 2
        },
        {
            "day": "Fri",
            "completedSessionCount": 17,
            "cancelledSessionCount": 2
        },
        {
            "day": "Sat",
            "completedSessionCount": 20,
            "cancelledSessionCount": 1
        },
        {
            "day": "Sun",
            "completedSessionCount": 22,
            "cancelledSessionCount": 1
        }
    ],
    "sessionsLastWeek": [
        {
            "day": "Mon",
            "completedSessionCount": 15,
            "cancelledSessionCount": 2
        },
        {
            "day": "Tue",
            "completedSessionCount": 14,
            "cancelledSessionCount": 1
        },
        {
            "day": "Wed",
            "completedSessionCount": 18,
            "cancelledSessionCount": 1
        },
        {
            "day": "Thu",
            "completedSessionCount": 19,
            "cancelledSessionCount": 1
        },
        {
            "day": "Fri",
            "completedSessionCount": 16,
            "cancelledSessionCount": 1
        },
        {
            "day": "Sat",
            "completedSessionCount": 21,
            "cancelledSessionCount": 2
        },
        {
            "day": "Sun",
            "completedSessionCount": 20,
            "cancelledSessionCount": 1
        }
    ]
}
    */
import api from "./api";

// Types for the admin homepage data
export interface PaymentDto {
  monthOrYear: number;
  totalPayments: number;
}

export interface SessionOverviewDto {
  day: string;
  completedSessionCount: number;
  cancelledSessionCount: number;
}

export interface HomePageDto {
  totalSessions: number;
  sessionGainPercentage: number;
  totalProfit: number;
  sessionProfitGainPercentage: number;
  totalSubjects: number;
  subjectGainPercentage: number;
  totalUsers: number;
  userGainPercentage: number;
  monthlyPaymentsForLastYear: PaymentDto[];
  yearlyPayments: PaymentDto[];
  sessionsThisWeek: SessionOverviewDto[];
  sessionsLastWeek: SessionOverviewDto[];
}

// Function to fetch homepage data
export const getHomepage = async (): Promise<HomePageDto> => {
  const response = await api.get("/admin/homepage");
  return response.data;
};
