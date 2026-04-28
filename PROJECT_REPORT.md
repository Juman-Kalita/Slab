# Project Report — Scaffolding Rental Management System

## Project Overview

**Project Name:** Scaffolding Rental Management System
**Client:** Nishikant Sir (Scaffolding Business Owner)
**Developer:** Juman Kalita
**Project Type:** Custom Web Application
**Status:** Live & Active
**Quoted Price:** $2,000 USD
**Delivery:** Completed on time with all requested features

---

## Project Description

A full-stack web application built to manage a scaffolding rental business. The system handles customer management, material issuance and returns, billing calculations, invoice generation, employee tracking, and admin operations — replacing a manual paper-based workflow entirely.

---

## Tech Stack

### Languages
| Language | Usage |
|----------|-------|
| TypeScript | All application logic, components, and services |
| TSX (TypeScript + JSX) | React UI components |
| SQL | Database schema, migrations, RLS policies |
| HTML | Entry point (`index.html`) |
| CSS | Via Tailwind utility classes |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | Core UI framework |
| React Router v6 | Client-side routing |
| Vite 5 | Build tool and dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Pre-built accessible component library |
| Radix UI | Headless UI primitives |
| Lucide React | Icon library |
| date-fns | Date arithmetic and formatting |
| jsPDF + jspdf-autotable | PDF invoice generation |
| Sonner | Toast notifications |
| Chart.js v4 | Analytics charts and graphs on admin dashboard |
| React Query v5 | Server state management and data caching |
| Zod | Runtime schema validation for all form inputs |
| React Hook Form | Form state management and validation |

### Backend / Database
| Technology | Purpose |
|------------|---------|
| AWS RDS (PostgreSQL) | Managed relational database on Amazon Web Services |
| AWS Amplify | Backend-as-a-Service (auth, storage, APIs) |
| PostgreSQL | Relational database with row-level security |
| AWS Cognito | Employee and admin authentication |
| AWS S3 | File uploads (payment screenshots, Aadhar photos) |
| AWS Lambda | Serverless functions for billing calculations |
| Twilio SMS API | SMS alerts to customers on dispatch and payment due |
| Razorpay Payment API | Online payment collection and reconciliation |
| SendGrid API | Invoice PDF delivery via email |
| Google Maps API | Site location pinning and transport distance estimation |

### Plugins & Integrations
| Plugin / Integration | Purpose |
|----------------------|---------|
| Vite PWA Plugin | Progressive Web App support — works offline on mobile at sites |
| React Hook Form + Zod | Form validation for all customer, site, and material inputs |
| Papa Parse | CSV export of billing reports and customer data for accounting |
| html2canvas | Capture and upload payment proof screenshots |

### Deployment & DevOps
| Tool | Purpose |
|------|---------|
| AWS EC2 + Nginx | Production hosting on dedicated cloud server |
| AWS CloudFront | CDN for global content delivery |
| GitHub Actions | CI/CD pipeline (auto-deploy on push) |
| GitHub | Version control and source code management |
| Bun / npm | Package management |

---

## Key Features Delivered

1. **Customer & Site Management** — Add customers, multiple sites per customer, track issue/end dates
2. **Material Issuance & Returns** — Issue multiple material types, track quantities, handle partial returns
3. **Smart Billing Engine**
   - Monthly rate billing for first-issue materials (Props, H-Frames, Scaffolding, etc.)
   - Daily rate billing for plates (Plates, New Changed, Old Changed)
   - Grace period logic per material type
4. **Invoice Generation** — Professional PDF invoices with itemized breakdown
5. **Payment Tracking** — Record payments, advance deposits, payment screenshots
6. **Inventory Management** — Real-time stock tracking across all material types (50+ types)
7. **Employee Management** — Add employees, track activity logs
8. **Admin Panel** — Full admin dashboard with customer management, financial adjustments, activity logs
9. **Dark Mode** — Full light/dark theme support
10. **Multi-contact Support** — Multiple contacts per customer

---

## Project Timeline

| Phase | Description | Duration |
|-------|-------------|----------|
| Phase 1 | Core rental management (customers, sites, materials) | 2 weeks |
| Phase 2 | Billing engine, invoices, payment tracking | 1 week |
| Phase 3 | Admin panel, employee tracking, inventory | 1 week |
| Phase 4 | Bug fixes, pricing updates, UI improvements | Ongoing |

**Total Development Time:** ~5 weeks

---

## Database Schema Summary

- `customers` — customer profiles, contacts, advance deposits
- `sites` — rental sites per customer, issue/end dates, charges
- `materials` — materials currently at each site
- `history_events` — full audit log of all actions (issue, return, payment)
- `inventory` — stock levels per material type
- `employees` — employee accounts and roles
- `activity_logs` — employee activity tracking

---

## Pricing Breakdown (Quoted to Client)

| Item | Cost |
|------|------|
| Frontend Development (React + TypeScript) | $700 |
| Backend & Database Setup (AWS RDS + PostgreSQL) | $400 |
| Billing Engine & Invoice Generator | $350 |
| Admin Panel & Employee Management | $300 |
| Deployment & CI/CD Setup (AWS EC2 + CloudFront + GitHub Actions) | $100 |
| Twilio SMS API — dispatch alerts & payment reminders to customers | $80 |
| Razorpay Payment Gateway — online payment collection & reconciliation | $90 |
| SendGrid API — automated invoice PDF delivery via email | $40 |
| Google Maps API — site location pinning & transport distance calculation | $60 |
| Testing, Bug Fixes & Revisions | $150 |
| **Total** | **$2,270** |

---

## Live URL

Deployed on AWS EC2 with CloudFront CDN — auto-deploys on every push to the `main` branch via GitHub Actions.

---

*Report generated: March 2026*
