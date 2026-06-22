# Gym Genix (COREX) - Detailed Project Features

Gym Genix is an enterprise-grade, Hybrid AI-Powered MERN ecosystem designed to manage gym operations, fitness intelligence, e-commerce, and administrative workflows. This document details each functional area and feature present in the platform based on the underlying codebase architecture.

## 1. Role-Based Access Control (RBAC) & Custom Dashboards
The platform utilizes a secure authentication system featuring both custom JWT auth and Google OAuth, splitting users into distinct roles, each with a tailored workspace:
*   **Admin Dashboard (`AdminDashboard.jsx`)**: The central command center. Provides full CRUD control over users, trainers, plans, inventory, and system settings. Includes audit logging and system-wide analytics.
*   **Reception Dashboard (`ReceptionDashboard.jsx`)**: Designed for front-desk operations. Facilitates fast-tracking check-ins, managing leads, handling walk-in inquiries, and monitoring daily attendance.
*   **Trainer Dashboard (`TrainerDashboard.jsx`)**: A portal for coaches to manage their assigned members, view 1-on-1 appointments, design custom training programs, and track client progress.
*   **Member Profile (`Profile.jsx`)**: The end-user dashboard where members can view their active subscriptions, health records, assigned workout/diet plans, and purchase history.

## 2. Advanced Attendance & QR Kiosk System
Replaces traditional check-in methods with a modern, automated flow:
*   **QR Kiosk (`QRKiosk.jsx`)**: A dedicated interface intended for a tablet/screen at the entrance. Members scan their unique QR codes for instant check-in.
*   **Attendance Tracking**: Logs entry times, maintains streaks, and feeds data to the analytics engine to identify gym peak hours and member retention.

## 3. AI-Powered Fitness Intelligence (Gemini AI)
One of the most advanced features of the platform, leveraging large language models to automate personal training:
*   **AI Fitness Assessment (`AIFitnessAssessment.jsx`)**: Users input their biometrics (weight, height, age, body fat %), goals, and limitations.
*   **Automated Generation**: The system pings the Gemini AI API to generate highly personalized, step-by-step workout regimes and diet protocols.
*   **Health Tracking**: Continuous tracking of health metrics over time, alongside a `TransformationPhoto` module to visually track physical progress.

## 4. Class Booking & Appointment Scheduling
A robust engine for managing time and gym resources:
*   **Group Classes (`Classes.jsx`)**: Admins can create recurring or one-off classes (e.g., Yoga, HIIT, CrossFit) with limited capacity. Members can browse the schedule and reserve slots.
*   **Trainer Appointments**: Members can book 1-on-1 sessions with specific trainers. Syncs with trainer availability and dashboard.

## 5. E-Commerce & Point of Sale (POS)
The platform features an integrated store to generate additional revenue streams:
*   **Product Store (`Products.jsx`)**: A digital storefront for gym supplements, apparel, and training gear.
*   **Cart & Checkout (`Cart.jsx`, `Checkout.jsx`)**: Standard e-commerce flow allowing members to add items to their cart and securely check out.
*   **Order Management**: Full lifecycle tracking of orders (Placed -> Processing -> Fulfilled) managed by admins or reception.
*   **Payments**: Secure processing of one-time product purchases and recurring membership subscription dues.

## 6. Workout & Nutritional Database
Tools for structured fitness management:
*   **Exercise Library (`Exercises.jsx`)**: A searchable, categorized database of exercises complete with instructions, targeted muscle groups, and potential video links.
*   **Diet Management (`Diet.jsx`)**: Creation of structured diet plans outlining macronutrients, meal timings, and dietary restrictions.
*   **Plan Programs**: Grouping of exercises and diets into trackable, multi-week programs for members to follow.

## 7. Gym Operations & CRM
Administrative tools designed to run the business efficiently:
*   **Lead Management**: A CRM subsystem to track potential members (leads), log follow-up calls, and convert them to active members.
*   **Automated Notifications**: In-app alerts for expiring memberships, upcoming classes, order updates, and system announcements.
*   **Audit Logging**: Security feature that tracks sensitive administrative actions (e.g., deleting a user, overriding a payment) to maintain accountability.

## 8. Analytics & Reporting
Data-driven insights for gym owners:
*   **Analytics Dashboard (`AnalyticsDashboard.jsx`)**: Visualizes key performance indicators (KPIs) using Recharts.
*   **Metrics Tracked**: Revenue trends, membership growth, most popular classes, product sales volume, and peak attendance hours.

## 9. Cloud-Native DevOps & CI/CD infrastructure
Under the hood, the project is built for scale:
*   **Containerized Environments**: Both frontend and backend are Dockerized.
*   **Automated Deployment**: GitHub Actions pipelines automatically build, test, and deploy code changes to AWS EC2.
*   **Self-Healing Architecture**: Docker Compose ensures failed services are automatically restarted. Nginx handles reverse proxying and load balancing.
