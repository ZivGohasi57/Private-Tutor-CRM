# Private Teaching Management System (CRM) & Telegram Companion

[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-orange.svg)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green.svg)](https://nodejs.org/)
[![Telegram](https://img.shields.io/badge/Bot-Telegram%20API-2CA5E0.svg)](https://core.telegram.org/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-Personal-green.svg)](#license)

A comprehensive **CRM Ecosystem** designed to streamline the workflow of private tutors and independent educators.
This project integrates a **React Web Dashboard** for management and a **Node.js Telegram Bot** for on-the-go access and notifications.

Built to solve real-world administrative challenges, including student management, complex scheduling, financial tracking (cash-flow basis), and automated reminders.

---

## 🧠 Core Features

### 🖥️ Web Dashboard (Vercel)
* **Student Management**: Full CRUD operations for student profiles, academic levels, and balance tracking.
* **Smart Scheduling**: Interactive Calendar view with recurring lessons, blocking specific hours, and history tracking.
* **Financial Tracking**: 
  * Real-time balance calculation per student.
  * Payment logging (Bit/PayBox/Cash/Bank Transfer).
  * **Cash-Flow Reports**: Tracks actual money received vs. theoretical lesson value.
* **Task & Grading**: Tracking student assignments, projects, and billing for grading time.
* **Responsive Design**: Mobile-first UI with **Dark Mode** support.

### 🤖 Telegram Bot Assistant (Render)
* **24/7 Availability**: Hosted on Render with UptimeRobot monitoring.
* **Smart Commands**:
  * `/agenda` - Instantly pulls the next 10 upcoming lessons from the database.
  * `/income` - Generates a detailed financial report for the current fiscal month (10th to 10th), aggregating payments and grading fees.
* **Automated Reminders**: Pushes notifications for upcoming lessons (online/frontal) directly to your phone.
* **Intelligent Data Parsing**: Filters out orphaned data and cross-references payments with student names automatically.

---

## 🚀 Tech Stack

### Frontend (Client)
* **Framework**: React.js (Vite)
* **Styling**: Tailwind CSS + Lucide React
* **Deployment**: Vercel

### Backend & Services
* **Database**: Firebase Firestore (Shared between App and Bot)
* **Authentication**: Firebase Auth
* **Bot Server**: Node.js (Express + Telegram API)
* **Bot Hosting**: Render (Web Service)
* **Monitoring**: UptimeRobot (Keep-alive mechanism)

---

## 🗂 Project Structure

```text
.
├── client/ (React App)
│   ├── src/
│   │   ├── components/     # UI Components (Forms, Calendar, Stats)
│   │   ├── lib/            # Firebase logic & storage hooks
│   │   └── pages/          # Application views
│   └── vite.config.js
│
├── bot/ (Node.js Service)
│   ├── index.js            # Main bot logic (Polling, Commands, Scheduler)
│   └── package.json        # Bot dependencies
│
└── README.md

```

## 🏗️ Deployment Architecture

This system uses a **Serverless + Microservice** approach:

1.  **The React App** runs on **Vercel**, serving the UI and handling direct database writes (creating students, logging lessons).
2.  **The Bot** runs on **Render** as a background service. It listens to the same Firestore database.
    * It runs a cron-job every minute to check for lesson reminders.
    * It listens to Telegram webhooks/polling for user commands.
    * It performs complex aggregations (like the Income Report) on the server side.

---

## 🧪 Development Philosophy

This project was built as a **personal initiative** to demonstrate full-stack capabilities, integrating cloud databases with multiple client interfaces (Web & Chat).
Key achievements include:

* **Data Consistency**: Ensuring the Bot and the Web App always show the same data from Firestore.
* **Error Handling**: Robust logic to handle "orphaned" payments or missing student data in reports.
* **Real-time UX**: Leveraging Firestore for instant updates across devices.

---

## 🗺️ Roadmap

- [x] Basic CRUD for Students and Lessons
- [x] Calendar View & Recurring Events
- [x] Financial Reports (Cash & Accrual basis)
- [x] Telegram Bot Integration (Reminders & Commands)

---

## 📄 License

**Personal Initiative Project**

Copyright (c) 2025 Ziv Gohasi.
