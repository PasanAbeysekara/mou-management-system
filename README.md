# MOU Management System

## Overview
The MOU (Memorandum of Understanding) Management System is a web-based application designed to streamline the submission, approval, and tracking of MOUs within an organization. It provides role-based access control for users, domain admins, and super admins to manage the workflow effectively.

## Features
- **User Authentication**: Secure login with NextAuth.js.
- **MOU Submission**: Users can submit MOUs with required details and documents.
- **Approval Workflow**: Domain admins can approve/reject MOUs related to their domain.
- **Super Admin Panel**: View and manage all MOUs and registered organizations.
- **Search & Filter**: Admins can search MOUs by title and filter them based on status.
- **Email Notifications**: Users receive email notifications upon approval at each stage.
- **Location Mapping**: Super admins can view registered organizations on a map and filter MOUs by location.
- **Real-time Updates**: MOUs nearing expiry (within 3 months) trigger automated notifications.

## Technologies Used
- **Frontend**: Next.js (React), TypeScript, Tailwind CSS, MUI
- **Backend**: Next.js API Routes, Prisma ORM, MySQL Database
- **Authentication**: NextAuth.js with credential-based login
- **Database**: MySQL, Hosted in Aiven.io
- **Storage**: Firebase Storage (for document uploads)
- **Email Service**: Nodemailer (for approval notifications)
- **Google Maps API**: Location selection for organizations

## Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (v18 or later)
- MySQL Database
- Firebase Project Setup (for document storage)
- Google Maps API Key

### Clone the Repository
```sh
git clone https://github.com/pasanabeysekara/mou.git
cd mou
```

### Install Dependencies
```sh
npm install
```

### Configure Environment Variables
Create a `.env.local` file in the root directory and configure the following:
```env
DATABASE_URL=mysql://user:password@localhost:3306/mou_db
JWT_SECRET=jwt-secret
NEXTAUTH_URL=
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

```

### Run Database Migrations
```sh
npx prisma migrate dev --name init
```

### Start the Development Server
```sh
npm run dev
```

### Build and Run for Production
```sh
npm run build
npm start
```

## Folder Structure
```
/mou-management
│── public/               # Static assets (including templates)
│── src/
│   ├── app/
│   │   ├── api/          # API routes (Next.js backend)
│   │   ├── auth/         # Authentication setup
│   │   ├── dashboard/    # Dashboard UI and logic
│   │   ├── admin-panel/  # Admin panel views
│   │   ├── submissions/  # MOU submission forms and handling
│   ├── components/       # Reusable UI components
│   ├── context/          # Context providers (e.g., AuthContext)
│   ├── lib/              # Utility functions (Firebase, Prisma, Email, etc.)
│   ├── styles/           # Global styles and theme configuration
│── prisma/               # Prisma schema and migrations
│── .env.local            # Environment variables
│── package.json          # Project dependencies and scripts
│── README.md             # Documentation (this file)
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user credentials.
- `POST /api/auth/logout` - Log out user.

### MOU Submissions
- `POST /api/mou-submissions` - Submit a new MOU.
- `GET /api/mou-submissions` - Get all MOU submissions.
- `GET /api/mou-submissions/{id}` - Get a specific MOU.
- `POST /api/mou-submissions/approve` - Approve an MOU.
- `POST /api/mou-submissions/reject` - Reject an MOU.

### Organizations
- `POST /api/organizations` - Add a new organization (Super Admin only).
- `GET /api/organizations` - Get all registered organizations.

## Deployment
- Ensure the `.env` file is correctly set up.
- Use Vercel, Netlify, or any Node.js hosting platform for deployment.
- Configure MySQL database on a remote server.
- Set up Firebase and Google Maps API keys for production use.

