# Gym Genix - Full-Stack Gym Management Platform

Gym Genix is a comprehensive, modern management solution for gyms and fitness centers. It centralizes all aspects of gym operations—Member management, class scheduling, product sales, and personalized fitness planning—into a single, intuitive platform.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4, Framer Motion (for smooth animations)
- **State & Data:** TanStack React Query v5, Context API
- **Routing:** React Router DOM v7
- **UI Components:** Lucide React (Icons), Recharts (Analytics visualization)
- **Feedback:** React Hot Toast
- **API Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Security:** JWT (JSON Web Tokens), Bcryptjs (password hashing), Helmet/CORS
- **Auth:** Custom Auth + Google OAuth integration
- **Validation:** Joi
- **Utilities:** Multer (file uploads), Dotenv, Cookie-parser

### Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose
- **Deployment:** Vercel (Production-ready configurations)
- **Development Tools:** Concurrently, Nodemon, ESLint

---

## ✨ Key Features

### 👤 Member & Trainer Management
- **Role-based Access:** Dedicated Dashboards for Admins, Trainers, and Members.
- **Profile Management:** Secure user profiles with customizable data.
- **Attendance Tracking:** Monitor daily member attendance and participation.

### 📅 Scheduling & Classes
- **Class Management:** Create and manage gym sessions, yoga classes, and more.
- **Bookings:** Members can browse schedules and book slots in real-time.

### 🏋️‍♂️ Health & AI Personalization
- **AI Workout Plans:** Integrated AI logic to generate personalized routines based on user goals.
- **Diet Planning:** Comprehensive diet management and recommendations.
- **Exercise Database:** A searchable library of exercises with details.

### 🛒 E-commerce & Payments
- **Product Store:** List and sell gym supplements, gear, and apparel.
- **Order Management:** Track product orders from placement to fulfillment.
- **Payment Integration:** Secure payment processing for products and memberships.

---

## 📂 Project Structure

```text
GYM/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # API call logic (Axios)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state management
│   │   ├── pages/          # View components (Dashboard, Home, etc.)
│   │   └── App.jsx         # Main routing and entry
├── server/                 # Express Backend
│   ├── controllers/        # Request handler  sdfgs dsfxfgsdxgf
│   ├── models/             # Mongoose schemas (MongoDB)
│   ├── routes/             # API endpoint definitions
│   ├── middleware/         # Auth & Error handling
│   ├── utils/              # Schedulers & Helpers
│   └── index.js            # Server entry point
├── docker-compose.yml      # Orchestration for local dev
└── package.json            # Main scripts (start, dev, install:all)
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker (Optional)

### Installation
1. Clone the repository.
2. Run the installation script from the root:
   ```bash
   npm run install:all
   ```
3. Set up environment variables in `client/.env` and `server/.env`.
4. Start the development environment:
   ```bash
   npm run dev
   ```

---

## 📄 Documentation Info
Created on: 2026-04-17
Project Version: 1.0.0
