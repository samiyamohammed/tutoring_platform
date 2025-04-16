# EduConnect - Online Learning Platform

EduConnect is a comprehensive online learning platform built with Next.js, Tailwind CSS, and shadcn/ui. It provides a seamless experience for students, tutors, and administrators with features like course management, video conferencing, document verification, and more.

## 📋 Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Features](#features)
- [Routes](#routes)
  - [Authentication Routes](#authentication-routes)
  - [Student Routes](#student-routes)
  - [Tutor Routes](#tutor-routes)
  - [Admin Routes](#admin-routes)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/educonnect.git
   cd educonnect
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   \`\`\`
   NEXT_PUBLIC_API_URL=your_api_url
   # Add other environment variables as needed
   \`\`\`

### Running the Application

1. Start the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

2. Open your browser and navigate to:
   \`\`\`
   http://localhost:3000
   \`\`\`

## ✨ Features

- **Multi-role System**: Separate interfaces for students, tutors, and administrators
- **Course Management**: Create, edit, and manage courses with modules and lessons
- **Video Conferencing**: Real-time video sessions with screen sharing and chat
- **Document Verification**: Secure verification process for tutors
- **Certificate Management**: Create and award certificates to students
- **Waiting List**: Queue system for popular courses
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🗺️ Routes

### Authentication Routes

| Route | Description | Link |
|-------|-------------|------|
| `/` | Landing page | [Go to Landing Page](http://localhost:3000/) |
| `/auth/signin` | Sign in page | [Go to Sign In](http://localhost:3000/auth/signin) |
| `/auth/signup` | Sign up page | [Go to Sign Up](http://localhost:3000/auth/signup) |
| `/auth/verify` | Email verification | [Go to Verify](http://localhost:3000/auth/verify) |

### Student Routes

| Route | Description | Link |
|-------|-------------|------|
| `/student/dashboard` | Student dashboard | [Go to Dashboard](http://localhost:3000/student/dashboard) |
| `/student/explore` | Explore available courses | [Go to Explore](http://localhost:3000/student/explore) |
| `/student/my-courses` | View enrolled courses | [Go to My Courses](http://localhost:3000/student/my-courses) |
| `/student/video-session` | Join video sessions | [Go to Video Sessions](http://localhost:3000/student/video-session) |
| `/student/certificates` | View earned certificates | [Go to Certificates](http://localhost:3000/student/certificates) |
| `/student/waiting-list` | View waiting list status | [Go to Waiting List](http://localhost:3000/student/waiting-list) |
| `/student/settings` | Account settings | [Go to Settings](http://localhost:3000/student/settings) |

### Tutor Routes

| Route | Description | Link |
|-------|-------------|------|
| `/tutor/dashboard` | Tutor dashboard | [Go to Dashboard](http://localhost:3000/tutor/dashboard) |
| `/tutor/courses` | Manage created courses | [Go to Courses](http://localhost:3000/tutor/courses) |
| `/tutor/create-course` | Create new course | [Go to Create Course](http://localhost:3000/tutor/create-course) |
| `/tutor/create-course/content` | Add course content | [Go to Course Content](http://localhost:3000/tutor/create-course/content) |
| `/tutor/create-course/assessment` | Create assessments | [Go to Assessments](http://localhost:3000/tutor/create-course/assessment) |
| `/tutor/video-session` | Host video sessions | [Go to Video Sessions](http://localhost:3000/tutor/video-session) |
| `/tutor/document-verification` | Submit verification documents | [Go to Verification](http://localhost:3000/tutor/document-verification) |
| `/tutor/earnings` | View and manage earnings | [Go to Earnings](http://localhost:3000/tutor/earnings) |
| `/tutor/settings` | Account settings | [Go to Settings](http://localhost:3000/tutor/settings) |

### Admin Routes

| Route | Description | Link |
|-------|-------------|------|
| `/admin/dashboard` | Admin dashboard | [Go to Dashboard](http://localhost:3000/admin/dashboard) |
| `/admin/users` | Manage users | [Go to Users](http://localhost:3000/admin/users) |
| `/admin/courses` | Manage all courses | [Go to Courses](http://localhost:3000/admin/courses) |
| `/admin/tutor-requests` | Review tutor verification requests | [Go to Tutor Requests](http://localhost:3000/admin/tutor-requests) |
| `/admin/certificate-templates` | Manage certificate templates | [Go to Certificate Templates](http://localhost:3000/admin/certificate-templates) |
| `/admin/upload-settings` | Configure file upload settings | [Go to Upload Settings](http://localhost:3000/admin/upload-settings) |
| `/admin/reports` | View and manage reports | [Go to Reports](http://localhost:3000/admin/reports) |
| `/admin/payments` | Manage payment transactions | [Go to Payments](http://localhost:3000/admin/payments) |
| `/admin/settings` | Platform settings | [Go to Settings](http://localhost:3000/admin/settings) |

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **Video Conferencing**: WebRTC
- **Authentication**: JWT-based authentication

## 🔍 For Beginners

### Understanding the Project Structure

- **`app/`**: Contains all the pages of the application organized by user role
- **`components/`**: Reusable UI components
- **`lib/`**: Utility functions and providers
- **`public/`**: Static assets like images

### Navigation Guide

1. Start by exploring the authentication pages:
   - Sign up for a new account
   - Sign in with your credentials
   - Verify your email

2. Based on your role (student, tutor, or admin), you'll be redirected to the appropriate dashboard.

3. Use the sidebar navigation to explore different features:
   - Students can browse courses, join sessions, and view certificates
   - Tutors can create courses, host sessions, and track earnings
   - Admins can manage users, review requests, and configure platform settings

### Common Tasks

- **For Students**:
  - Enrolling in a course: Go to Explore → Find a course → Click Enroll
  - Joining a video session: Go to Video Sessions → Select a scheduled session → Join

- **For Tutors**:
  - Creating a course: Go to Create Course → Fill in details → Add content → Publish
  - Hosting a session: Go to Video Sessions → Create New Session → Invite students

- **For Admins**:
  - Approving a tutor: Go to Tutor Requests → Review documents → Approve/Reject
  - Managing certificates: Go to Certificate Templates → Create/Edit templates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
