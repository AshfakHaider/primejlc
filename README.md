# Prime Japanese Language Centre CRM

Modern agency management CRM for Prime Japanese Language Centre, built with Next.js, TypeScript, Tailwind CSS, shadcn-style UI primitives, Prisma, and PostgreSQL.

## Modules

- Dashboard with student, intake, document, COE, visa, income, expense, and profit/loss metrics
- Lead management with Kanban/list views, city and interest filters, notes, follow-up dates, and WhatsApp/Facebook/call actions
- Student management with search, filters, create/delete CRUD, counselor fields, intake, city, and status tracking
- Language course management with batches, sensei, schedule, attendance, fee status, and JLPT/NAT status
- Admission pipeline from Lead to Fly to Japan
- Document checklist with required document completion progress and file model support
- School management CRUD for partner schools, intakes, fees, deadlines, contacts, and notes
- Payment management CRUD with receipt numbers, paid/due amounts, and payment history
- Expense management CRUD with Prime-specific categories
- Reports for students, intakes, payments, expenses, profit/loss, visa success, and COE success
- Users, roles, protected routes, secure password hashes, and JWT cookie login
- Settings page with agency contact info

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start PostgreSQL:

```bash
docker compose up -d
```

4. Create tables and seed sample data:

```bash
npx prisma migrate deploy
npm run db:seed
```

5. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy To Vercel

1. Push this repository to GitHub.
2. Create a new Vercel project from the GitHub repository.
3. Add these environment variables in Vercel:

```bash
DATABASE_URL="your-production-postgres-url"
JWT_SECRET="your-long-random-secret"
```

4. Apply the database schema to the production database:

```bash
npx prisma migrate deploy
```

5. Deploy from Vercel. The build command is already handled by `npm run build`, which runs `prisma generate && next build`.

## Seed Login

- Email: `admin@primejlc.com`
- Password: `Prime@12345`

## Agency Info

Prime Japanese Language Centre  
Mobile: `01798562705`  
Email: `primejapaneselanguagecentrez@gmail.com`  
Address: `House# 68 (2nd Floor), Road# 12, Sector# 10, Uttara, Dhaka-1230`
