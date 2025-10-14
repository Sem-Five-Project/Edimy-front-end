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
          }
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
            title: "Pricing Policies",
            url: "/dashboard/admin/payments/pricing",
          }
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
            title: "Subject Management",
            url: "/dashboard/admin/subjects",
          },
          {
            title: "Class Management",
            url: "/dashboard/admin/tags",
          },
        ],
      },
      {
        title: "ADMIN",
        icon: Icons.User,
        items: [
          {
            title: "Create Admin",
            url: "/dashboard/admin/ADMIN/create",
          },
        ],
      }
    ],
  },
];
