import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/admin/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "User Management",
        icon: Icons.User,
        items: [
          {
            title: "Students",
            url: "/dashboard/admin/users/students",
          },
          {
            title: "Tutors",
            url: "/dashboard/admin/users/tutors",
          },
        ],
      },
      {
        title: "Tutor Verification",
        icon: Icons.Shield,
        items: [
          {
            title: "Pending Approvals",
            url: "/dashboard/admin/verification/pending",
          },
          {
            title: "Verified Tutors",
            url: "/dashboard/admin/verification/verified",
          },
          {
            title: "Re-verification",
            url: "/dashboard/admin/verification/re-verify",
          },
        ],
      },
      {
        title: "Session Management",
        icon: Icons.Calendar,
        items: [
          {
            title: "All Sessions",
            url: "/dashboard/admin/sessions",
          },
          {
            title: "Ongoing Sessions",
            url: "/dashboard/admin/sessions/ongoing",
          },
          {
            title: "Session Reports",
            url: "/dashboard/admin/sessions/reports",
          },
        ],
      },
      {
        title: "Payments & Transactions",
        icon: Icons.CreditCard,
        items: [
          {
            title: "All Transactions",
            url: "/dashboard/admin/payments/transactions",
          },
          {
            title: "Tutor Payouts",
            url: "/dashboard/admin/payments/payouts",
          },
          {
            title: "Payment Disputes",
            url: "/dashboard/admin/payments/disputes",
          },
          {
            title: "Pricing Policies",
            url: "/dashboard/admin/payments/pricing",
          },
          {
            title: "Financial Reports",
            url: "/dashboard/admin/payments/reports",
          },
        ],
      },
      {
        title: "Reports & Analytics",
        icon: Icons.PieChart,
        items: [
          {
            title: "KPI Dashboard",
            url: "/dashboard/admin/analytics/kpi",
          },
          {
            title: "Session Trends",
            url: "/dashboard/admin/analytics/sessions",
          },
          {
            title: "Payment Trends",
            url: "/dashboard/admin/analytics/payments",
          },
          {
            title: "User Analytics",
            url: "/dashboard/admin/analytics/users",
          },
        ],
      },
      {
        title: "Notifications",
        icon: Icons.Bell,
        items: [
          {
            title: "Email Templates",
            url: "/dashboard/admin/notifications/email-templates",
          },
          {
            title: "Announcements",
            url: "/dashboard/admin/notifications/announcements",
          },
          {
            title: "SendGrid Dashboard",
            url: "/dashboard/admin/notifications/sendgrid",
          },
        ],
      },
      {
        title: "Support System",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Support Tickets",
            url: "/dashboard/admin/support/tickets",
          },
          {
            title: "Escalations",
            url: "/dashboard/admin/support/escalations",
          },
          {
            title: "FAQ Management",
            url: "/dashboard/admin/support/faq",
          },
        ],
      },
      {
        title: "Content Management",
        icon: Icons.Table,
        items: [
          {
            title: "Subjects & Categories",
            url: "/dashboard/admin/content/subjects",
          },
          {
            title: "Tags & Filters",
            url: "/dashboard/admin/content/tags",
          },
        ],
      },
      {
        title: "Review Moderation",
        icon: Icons.StarRating,
        items: [
          {
            title: "Ratings & Reviews",
            url: "/dashboard/admin/moderation/reviews",
          },
          {
            title: "Complaints",
            url: "/dashboard/admin/moderation/complaints",
          },
        ],
      },
      {
        title: "Security",
        icon: Icons.LockShield,
        items: [
          {
            title: "Access Logs",
            url: "/dashboard/admin/security/logs",
          },
          {
            title: "Fraud Detection",
            url: "/dashboard/admin/security/fraud",
          },
          {
            title: "GDPR Compliance",
            url: "/dashboard/admin/security/gdpr",
          },
        ],
      },
      {
        title: "Forms",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/dashboard/admin/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/dashboard/admin/forms/form-layout",
          },
        ],
      },
      {
        title: "Tables",
        url: "/dashboard/admin/tables",
        icon: Icons.Table,
        items: [
          {
            title: "Tables",
            url: "/dashboard/admin/tables",
          },
        ],
      },
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/dashboard/admin/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/dashboard/admin/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/dashboard/admin/ui-elements/buttons",
          },
        ],
      },
      {
        title: "Pages",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Settings",
            url: "/dashboard/admin/pages/settings",
          },
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/dashboard/admin/auth/sign-in",
          },
        ],
      },
    ],
  },
];
