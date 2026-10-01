# Incident System (Enterprise Ops)

A full-stack, enterprise-grade Incident Response platform built with Next.js, Tailwind CSS (v4), and Prisma (SQLite). It features a modern Material Design 3 (MD3) dark/light theme, role-based access control, and comprehensive dashboard analytics.

## Features

- **Role-Based Workspaces**: Distinct views and permissions for `Employee`, `Incident Handler`, `Department Head`, and `Admin`.
- **Admin Command Center**: Real-time KPI telemetry, department workload distribution charts, and severity tracking.
- **Incident Lifecycle**: Report, triage, assign, update severity, resolve, and reopen tickets.
- **Audit Logging**: Immutable activity logs for every action taken on an incident.
- **Material Design 3**: Fully responsive, accessible, with seamless Dark / Light mode toggling using `next-themes`.
- **Database**: Prisma ORM with SQLite for easy local setup.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Prisma](https://www.prisma.io/) + SQLite
- **Icons**: Material Symbols Outlined
- **Fonts**: Space Grotesk, Plus Jakarta Sans, JetBrains Mono

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hannielcyber1/Incident-Response-System.git
   cd Incident-Response-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

*Note: The SQLite database file (`dev.db`) is ignored from version control for security. You will start with a fresh database when cloning.*
