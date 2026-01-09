# Project Synopsis: Smart Attendance Management System

## 1. Introduction
The **Smart Attendance Management System** is a cutting-edge web application designed to revolutionize the educational attendance process. By replacing error-prone manual methods with a high-performance, digital solution, it ensures accuracy, real-time tracking, and seamless accessibility. The system utilizes a modern tech stack to deliver a native app-like experience via Progressive Web App (PWA) standards, catering to Students, Faculty, and Administrators with distinct, secure portals.

## 2. Problem Statement
Traditional attendance tracking in educational institutions relies on manual paper registers, which are time-consuming, susceptible to proxy attendance, and lack immediate data insight. Existing digital solutions often suffer from poor mobile responsiveness, clunky user interfaces, and the inability to function offline or in low-connectivity environments.

## 3. Objectives
-   **Modern User Experience**: Deliver a fluid, responsive UI with PWA capabilities (offline support, installability) that rivals native mobile apps.
-   **Security & Integrity**: Implement robust Role-Based Access Control (RBAC) and anti-proxy measures like Geo-fencing and device fingerprinting.
-   **Automation**: Streamline attendance marking via dynamic QR codes and instant database updates.
-   **Scalability**: Built on a serverless-ready architecture to handle growing student and faculty databases efficiently.

## 4. Technology Stack

### Frontend & Core
-   **Framework**: Next.js 16.1 (App Router) - Leveraging Server Components for performance.
-   **Library**: React 19 - For a component-based, interactive UI.
-   **Styling**: Tailwind CSS v4 - Utilizing the latest utility-first engine for rapid, responsive design.
-   **Language**: TypeScript - Ensuring type safety and code maintainability.
-   **PWA**: `@ducanh2912/next-pwa` - Enabling offline caching, installability, and splash screens.

### Backend & Database
-   **API**: Next.js API Routes (Serverless Functions).
-   **Database**: PostgreSQL (Neon Serverless) - Robust, scalable relational data storage.
-   **ORM/Query**: Direct SQL / `pg` client for optimized performance.
-   **Authentication**: NextAuth.js (v4) with custom credential providers and Bcrypt hashing.

### Visuals & Tools
-   **Icons**: Lucide React.
-   **Charts**: Recharts for data visualization.
-   **QR**: `qrcode` (Generation) and `html5-qrcode` (Scanning).
-   **Date Handling**: `date-fns`.

## 5. Key Features & Modules

### A. Security & Authentication
-   **Role-Based Access Control (RBAC)**: Distinct login flows and dashboard restrictions for **Admins**, **Faculty**, and **Students**.
-   **Secure Login**: Hashed passwords and session management via NextAuth.
-   **Password Gate**: Specific UI flows for initial setup and password changes.

### B. Attendance System
-   **Dynamic QR Codes**: Faculty generate unique, time-bound QR codes for specific class sessions to prevent sharing.
-   **Geo-Fencing**: Validates student location (Latitude/Longitude) during scanning to ensure physical presence.
-   **Device Fingerprinting**: Captures device info to discourage proxy attendance tracking.
-   **Manual Attendance**: Fallback option for faculty to mark attendance manually if technical issues arise.

### C. Role-Specific Dashboards
1.  **Admin Portal**:
    -   **User Management**: Create and manage Student and Faculty profiles.
    -   **Academic Structure**: Configure Subjects, Classes/Sections, and Timetables.
    -   **Global Settings**: System-wide configurations.

2.  **Faculty Portal**:
    -   **Session Management**: Create attendance sessions linked to the timetable.
    -   **Live Tracking**: Monitor incoming attendance scans in real-time.
    -   **Reports**: View class-wise attendance summaries.

3.  **Student Portal**:
    -   **QR Scanner**: Integration camera access to scan class codes.
    -   **History**: View personal attendance records and percentage aggregations.
    -   **Profile**: Manage personal settings and view academic details.

### D. Advanced Features
-   **Timetable Management**: Visual representation of weekly schedules for all roles.
-   **Analytics**: Interactive charts displaying attendance trends and subject-wise performance.
-   **PWA Integration**:
    -   **Splash Screen**: Custom startup visual for a branded feel.
    -   **Mobile-First Design**: Optimized touch targets and layout for smartphones.
    -   **App Icon**: Installable to home screen without app store requirements.

## 6. Database Schema Overview
The system relies on a relational schema with these core entities:
-   **Users**: Central identity table for all roles.
-   **Faculty & Students**: Extended profile tables linked to Users.
-   **Subjects & Classes**: Academic metadata.
-   **Timetable**: Schedules linking Classes, Subjects, and Faculty.
-   **Attendance_Sessions**: Instances of a class for a specific date/time.
-   **Attendance_Records**: Individual logs linked to Students and Sessions.

## 7. Conclusion
This project demonstrates a production-grade application of the latest web technologies (Next.js 16, React 19) to solve a critical institutional problem. It balances aesthetic excellence with functional rigor, providing a secure, efficient, and user-friendly platform for modern education management.
