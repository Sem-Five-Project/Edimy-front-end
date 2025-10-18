# Edimy — User Manual (Tutors, Students, Admins)

This user manual is written for the people who will use the Edimy platform: tutors, students, and administrators. It focuses on the typical workflows each role will perform, where to find features in the UI (based on the repository's `src/app` and `src/components` layout), and common troubleshooting tips.
## Table of contents
- Tutor guide
- Student guide
- Admin guide
- Authentication & accounts
- System overview
- Login
- Sign up (registration)
- Logout
- Booking and schedule workflows
## Authentication & accounts

The Authentication section is split to make it easy to find instructions for Login, Sign up, and Logout. The project appears to use Firebase for client-side services (see `src/lib/firebaseConfig.ts` and `src/lib/firebaseMessaging.ts`), so authentication flows may be powered by Firebase Authentication or a similar provider.

### System overview

High-level architecture (user-facing perspective):

- Client: Next.js React app (code in `src/`) — renders pages, manages client routing, displays dashboards for tutors/students/admins and handles UI interactions.
- Authentication: Firebase Authentication (likely) for sign-in, sign-up, password reset, and session management; environment variables in `src/lib/firebaseConfig.ts` initialize the Firebase client.
- Backend/API: The repo includes `src/lib/api.ts` and admin helper files indicating server endpoints or API wrappers; some functions may call an external backend (not included here) for bookings, payments, and user management.
- Real-time / messaging: Firebase Cloud Messaging or Firestore listeners for in-app notifications and messaging. Service worker found at `public/firebase-messaging-sw.js`.
- Third-party integrations: Zoom SDK (`@zoomus/websdk`) for live sessions, Cloudinary for media assets, and payment providers (if integrated) for billing.

Security and session notes:

- Because `NEXT_PUBLIC_` env variables are used for client-side Firebase config, sensitive server-side keys are expected to be stored on the backend (not in the repo). Keep `.env.local` out of version control.
- Authentication state is typically held in secure, HttpOnly cookies or local storage via the Firebase SDK — follow the UI sign-in/sh-out flows for a consistent user experience.

### Login

This section explains how to sign in to the platform and covers common login flows.

How to login

1. Navigate to the Login page (`/login`) or click the Login button on the landing page.
2. Enter your email and password (or use social sign-in if offered, e.g., Sign in with Google).
3. Click Sign In.

Role-specific notes

- Tutors: After login, you should see the Tutor Dashboard. If you have a pending tutor verification, some tutor features may be restricted.
- Students: After login, you should be able to browse tutors/courses and manage bookings.
- Admins: Admin users will see the Admin Dashboard with additional links to user management, payments, and settings.

Troubleshooting

- "Invalid credentials": Verify email and password. Use Forgot Password to reset credentials.
- Stuck on spinner or session not created: Check browser console for Firebase errors and ensure `NEXT_PUBLIC_FIREBASE_*` env variables are set.

### Sign up (registration)

How to register

1. Go to the Register page (`/register`) or click Sign Up on the landing page.
2. Fill required information (name, email, password). If registering as a Tutor, you may be asked for additional info like subjects, experience, and documents for verification.
3. Submit the registration form.
4. Verify your email if the platform requires email verification: open the link sent to your email address.

Tutor onboarding notes

- Tutor accounts often require an approval step. After signing up as a tutor, complete your profile and upload any required documents. The admin may need to review and approve your tutor account before your listings are public.

Security and privacy

- Choose a strong password and enable two-factor authentication if the platform supports it.

Troubleshooting

- No verification email: Check spam folder. If still not received, ask an admin to resend or check backend email provider.

### Logout

How to logout

1. Click your profile/avatar in the app header.
2. Select Logout / Sign out.
3. The application will clear local session state and redirect you to the landing or login page.

Notes

- If you remain signed in after logging out, clear site cookies and local storage and try again. Also confirm the app's sign-out redirect URL in case it returns to a cached authenticated page.

Troubleshooting

- "Logout did not end session": Some browsers cache authenticated pages; close the tab or clear cookies. If the backend uses server-side sessions, ensure server-side session termination is successful (admin can check server logs).
# Edimy — User Manual (Tutors, Students, Admins)

This user manual is written for the people who will use the Edimy platform: tutors, students, and administrators. It focuses on the typical workflows each role will perform, where to find features in the UI (based on the repository's `src/app` and `src/components` layout), and common troubleshooting tips.

Note: This manual assumes you have valid accounts for the role (tutor, student, or admin) and that the application is deployed or running locally at http://localhost:3000.

## Table of contents
- Tutor guide
- Student guide
- Admin guide
- Authentication & accounts
- Booking and schedule workflows
- Messaging / Notifications
- Profile and settings
- Troubleshooting & FAQs

## Tutor guide

Who this is for

- Tutors who want to create availability, manage bookings, run classes, and view earnings/analytics.

Logging in

- Visit the app's login page (e.g., `/login` or the landing page login button).
- Use your tutor credentials. If the app supports social/Firebase authentication, you may use Google or email sign-in depending on what the admin has enabled.

Dashboard (typical flows)

- After login, select the Tutor dashboard. The repo contains `src/app/dashboard/tutor`, which includes pages like `idle` — this indicates a dedicated tutor area.
- Key sections you'll typically find:
  - Availability / Schedule: set recurring or one-off slots you can teach.
  - Bookings: list of upcoming and past bookings, with actions to accept or manage sessions.
  - Classes / Content: create or manage class materials or session outlines.
  - Payments / Earnings: view payment history if the platform handles tutor payouts.

Creating availability

1. Go to the Schedule or Availability page.
2. Choose a date and time range; set recurrence if needed.
3. Save the slot. Students will be able to see and book these slots.

Managing bookings

1. Open the Bookings page to see requests.
2. Accept or reject booking requests depending on your availability.
3. For accepted bookings, confirm meeting details (time, platform, link).

Running classes

- The platform may integrate Zoom (see dependency `@zoomus/websdk`). If so, accepted bookings might contain a meeting link or an in-app join button.
- Click the session link or join button when it's time.

Notifications

- Tutors receive email/in-app notifications for new bookings, cancellations, messages, and payment updates.

Notes for tutors

- Keep your profile updated: photo, bio, subjects, hourly rate.
- Block off times when you’re unavailable.

## Student guide

Who this is for

- Students who want to search tutors or classes, book sessions, pay for classes, and message tutors.

Finding tutors / classes

1. Use the search or browse features from the landing page or dashboard.
2. Filter by subject, availability, rating, language, or other attributes.

Booking a session

1. Select a tutor and view their available time slots.
2. Pick a slot and confirm the booking.
3. Pay if required (payment integration is optional; the repo has `cloudinary` but payment adapters may vary).
4. You’ll receive a booking confirmation and a calendar invite or link.

Joining a session

- At the scheduled time, open your bookings page and click Join. If the session uses Zoom or other integrated SDKs, follow the on-screen instructions to join.

Messaging tutors

- Use the in-app messaging or contact form to clarify materials, time, or topics before the class. The repo contains `src/lib/firebaseMessaging.ts` and `fcmUtils.ts` which indicate notification/messaging features may be present.

Profile & payment methods

- Keep your profile updated and add payment methods if the platform accepts online payments.

## Admin guide

Who this is for

- Platform administrators who manage users, payments, content, platform settings, and analytics.

Admin dashboard

- Admin pages and APIs likely live under `src/app/dashboard/admin` and in `src/lib/admin*.ts` files (`admin.ts`, `adminPayments.ts`, `adminSession.ts`, etc.). Typical options include:
  - Manage users (view/edit tutor and student accounts)
  - Approve tutor profiles or verifications
  - Monitor bookings and disputes
  - Manage payouts and payment settings
  - Configure platform settings (subjects, pricing, notifications)

Common tasks

1. View user lists and search for a user by email or id.
2. Update user roles (promote/demote, suspend accounts).
3. Troubleshoot bookings and issue refunds if payment integration supports it.

## Authentication & accounts

- Sign up: Users register using the registration form (see `e2e` tests for flows like register and login which show expected UI behavior).
- Verification: If the app requires email verification, follow the verification link sent to your email.
- Reset password: Use the Forgot Password option on the login page.

## Booking and schedule workflows (summary)

For Students:

1. Search for tutor > select slot > book > pay (if required) > receive confirmation.

For Tutors:

1. Create availability > approve bookings or let auto-accept run > run the session > log completion.

For Admins:

1. Monitor bookings > resolve disputes > manage refunds/payouts > report on engagement.

## Messaging / Notifications

- Notifications may be delivered through Firebase Cloud Messaging (see `public/firebase-messaging-sw.js` and `src/lib/firebaseMessaging.ts`).
- Ensure you have notifications enabled in your browser or device to receive in-app push.

## Profile and settings

- Update profile information (photo, bio, subjects, rates) from the Profile or Settings page.
- Configure notification preferences (email, push, SMS if available).

## Troubleshooting & FAQs

1. I can’t log in / forgot password
   - Use the Forgot Password flow. Confirm your email. If still failing, contact an admin.

2. Booking failed or payment problem
   - Check your payment method. Confirm whether payments are enabled for the environment (development may not have live payments enabled).

3. I don’t see tutor availability
   - Tutors must create availability slots. If a tutor claims they created slots but students cannot see them, ask the tutor to confirm and ensure the listing is published.

4. I didn’t receive notifications
   - Check browser or device notification permissions. If using the web app, ensure `public/firebase-messaging-sw.js` is accessible at the root and that your browser supports service workers.

5. Session join link doesn’t work
   - Verify the session time and timezone; open the booking details for a join link. If link uses a third-party (Zoom), make sure the meeting is still active.

## Short role-based cheatsheet

- Tutors: set availability, manage bookings, join sessions, update profile.
- Students: search, book, pay, join sessions, message tutors.
- Admins: manage users, bookings, payments, and platform settings.

---

If you want, I can now:

- Add a `CONCISE_USER_QUICKSTART.md` with screenshots or annotated UI pointers (I can add placeholder screenshots and instructions on where to capture them).
- Generate role-based checklists as printable PDFs (I can create markdown which you can convert).
