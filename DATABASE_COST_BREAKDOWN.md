# Enterprise Database & Cloud Infrastructure — Cost Breakdown

**Prepared by:** S. S. Khorjuwekar
**Date:** March 2026
**Total: Rs.65,000 (2-Year Plan)**

---

## What This Covers

| # | Service | Description | Cost |
|---|---------|-------------|------|
| 1 | **Cloud Database Server** | AWS RDS PostgreSQL instance — dedicated server for storing all application data securely | Rs.28,000 |
| 2 | **Multi-AZ High Availability Setup** | Duplicate standby server in a separate data center — if primary server fails, backup takes over automatically with zero downtime | Rs.10,000 |
| 3 | **Encrypted Storage & Backup System** | AES-256 encrypted storage with automated daily backups, 30-day backup retention, point-in-time recovery | Rs.8,000 |
| 4 | **Private Network & Security Configuration** | VPC (Virtual Private Cloud) isolation — database is on a private network, not accessible from the public internet. Firewall rules, SSL/TLS encryption for all connections | Rs.7,000 |
| 5 | **Auto-Scaling & Performance Tuning** | Server automatically scales up during high traffic, scales down during low usage — no manual intervention needed | Rs.5,000 |
| 6 | **CDN & Global Content Delivery** | Content Delivery Network setup — ensures fast load times regardless of user location | Rs.4,000 |
| 7 | **24/7 Monitoring & Incident Response** | Automated health checks, uptime monitoring, instant alerts if any issue is detected | Rs.3,000 |
| | **TOTAL** | | **Rs.65,000** |

---

## Plan Duration

- Covers full **2 years** of managed infrastructure
- No renewal surprises — fixed cost for the entire period
- After 2 years, renewal at market rate (estimated Rs.25,000–30,000/year)

---

## Uptime Guarantee

- **99.99% SLA** — less than 1 hour of downtime per year
- Automatic failover — if server crashes, backup server takes over in under 60 seconds
- Daily backups — data can be restored to any point within the last 30 days

---

## Security Standards

- AES-256 encryption at rest (industry standard used by banks)
- SSL/TLS encryption for all data in transit
- VPC private network — database never exposed to public internet
- Role-based access — only authorized application can connect to database
- Full audit logs — every database action is recorded

---

## Why This Costs Rs.65,000

Running a production-grade database on AWS with high availability, encryption, backups, and monitoring is not cheap. Here is a rough breakdown of what AWS charges for this setup:

| AWS Service | Approx. Cost |
|-------------|-------------|
| RDS PostgreSQL (db.t3.medium, Multi-AZ) | ~Rs.18,000/year |
| Storage (100 GB gp3 SSD) | ~Rs.3,000/year |
| Automated Backups & Snapshots | ~Rs.2,000/year |
| Data Transfer & CDN | ~Rs.2,000/year |
| Setup, configuration & management fee | Rs.15,000 (one-time) |
| **2-Year Total** | **~Rs.65,000** |

---

*Prepared by S. S. Khorjuwekar | Cell: 9422055041 / 9422076645*
