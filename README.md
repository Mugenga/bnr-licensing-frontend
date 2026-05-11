# Bank Licensing and Compliance Portal Frontend

## 1. Project Overview

This is the frontend for the Bank Licensing and Compliance Portal. It gives applicants, officers, approvers, and system administrators an interface for working through the licensing process.

Applicants can create applications, upload documents, submit applications, respond when more information is requested, and follow their own applications. 

Officers can review applications, request missing documents, and send applications forward for approval. Approvers can make the final decision. Superadmins can manage users, roles, and permissions.

---

## 2. Technology Stack

The frontend was built with:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

I used shadcn/ui for reusable interface components.

---

## 3. How to Run the Frontend

Before starting the frontend, make sure the backend is already running.

Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
````

If this variable is not added, the frontend will use:

```txt
http://localhost:5000/api
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the frontend in your browser:

```txt
http://localhost:3000
```

To test the application, log in with one of the seeded users from the backend:

| Role       | Email                 | Password       |
| ---------- | --------------------- | -------------- |
| Superadmin | `superadmin@bnr.rw` | `Password123!` |
| Applicant  | `applicant@bnr.rw`  | `Password123!` |
| Officer    | `officer@bnr.rw`    | `Password123!` |
| Approver   | `approver@bnr.rw`   | `Password123!` |

````