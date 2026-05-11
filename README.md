# Bank Licensing and Compliance Portal Frontend

## 1. Project Overview

This project is the frontend interface for the Bank Licensing and Compliance Portal, a web-based system designed to support the licensing workflow of commercial banks and other regulated financial institutions. The portal is intended to replace a manual process that would normally depend on emails, spreadsheets, and scattered document handling.

The frontend provides a role-based working environment for applicants, licensing officers, approvers, and system administrators. It connects directly to the backend API and presents the application workflow in a clear and usable way, from application creation up to review, document requests, final approval, or rejection.

### Purpose

The main purpose of this frontend is to make the regulatory workflow easier to follow and harder to misuse. Applicants can submit and track licensing applications, officers can review submissions and request additional documents, approvers can make final decisions, and superadmins can manage users, roles, and permissions.

### Technology Stack

The frontend was built using:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Query for server state management
- Axios for backend API communication
- React Hook Form and Zod for form validation
- Lucide React for icons

## System Integration

## User Roles Supported

The interface supports the four default roles from the backend:

- Applicant
- Officer
- Approver
- Superadmin

## Default Test Accounts

After running the backend seed command, the following accounts can be used:

| Role | Email | Password |
| --- | --- | --- |
| Superadmin | `superadmin@nrb.test` | `Password123!` |
| Applicant | `applicant@nrb.test` | `Password123!` |
| Officer | `officer@nrb.test` | `Password123!` |
| Approver | `approver@nrb.test` | `Password123!` |

## Environment Configuration

Create a `.env.local` file in the frontend root

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

If this variable is not provided, the frontend assumes that the backend API is available at `http://localhost:5000/api`.

## How to Run the Full Application

1. First start the backend (More detailes in the backend ReadME.md file):

```bash
cd bank-licensing-backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

2. Then start the frontend:

```bash
cd bank-licensing-frontend
npm install
npm run dev
```

3. The frontend will be available at the URL defined in Next.js:

```txt
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Runs the frontend in development mode.

```bash
npm run build
```

This creates a production build.

```bash
npm run start
```

Runs the production build after `npm run build`.


## Main Pages

The frontend includes the following major pages:

- Landing page
- Login page
- Dashboard
- Applications list
- New application form
- Application details page
- Users management page
- Roles and permissions page

The dashboard and navigation change depending on the logged-in user's role.
