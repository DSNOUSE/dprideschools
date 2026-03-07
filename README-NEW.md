# DPRIDE International School Website

<div align="center">
  
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](tests/)

A modern, full-featured school management and information system built with Next.js, TypeScript, and PostgreSQL.

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## 🎯 Overview

DPRIDE International School website is an admin-protected Next.js application with PostgreSQL database and Sanity CMS integration. It provides a complete school management system with:

- **Public Website**: School information, admissions, news, and results lookup
- **Admin Portal**: Comprehensive management dashboard with RBAC
- **Parent Portal**: View children's academic performance
- **Student Portal**: Check results and academic records

## ✨ Features

### Public Website
- 🏫 School information and programs
- 📰 Dynamic news and events (Sanity CMS)
- 📅 School calendar
- 📝 Online application forms
- 📊 Public results lookup
- 📧 Contact forms

### Admin Portal
- 👥 Student management (CRUD operations)
- 📚 Academic records and grading
- 📊 Results processing and generation
- 👨‍🏫 User and role management
- 📨 Parent notification system
- 📈 Dashboard with analytics
- 🎨 Content management (Sanity Studio)

### Security & Quality
- 🔐 NextAuth.js authentication with JWT
- 🛡️ Role-based access control (RBAC)
- ✅ Input validation with Zod
- 🚨 Comprehensive error handling
- 📝 Structured logging
- 🧪 Unit and integration tests
- 🔒 Security headers and CSRF protection

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **CMS**: [Sanity.io](https://www.sanity.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Material-UI](https://mui.com/)
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- **Validation**: [Zod](https://zod.dev/)

## 📦 Prerequisites

- **Node.js**: 18+ (tested with Node 20)
- **PostgreSQL**: 14+ 
- **npm** or **yarn**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/DSNOUSE/dprideinternationalschool.git
cd dprideinternationalschool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp env.example .env
```

Edit `.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dprideschools"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="development"
SANITY_PREVIEW_SECRET="your-preview-secret"
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

### 4.Set Up the Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data
ADMIN_EMAIL="admin@dprideschools.com" ADMIN_PASSWORD="YourPassword123!" npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Access Admin Area

- Navigate to [http://localhost:3000/admin-signin](http://localhost:3000/admin-signin)
- Login with the credentials from step 4
- Access Sanity Studio at [http://localhost:3000/admin/studio](http://localhost:3000/admin/studio)

## 📁 Project Structure

```
dprideschools/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication
│   │   ├── students/       # Student management
│   │   ├── academics/      # Academic operations
│   │   └── results/        # Results lookup
│   ├── admin/              # Admin portal
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── students/       # Student management
│   │   └── academics/      # Academic management
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   ├── loading.tsx         # Loading state
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # Robots.txt
├── src/
│   ├── components/         # React components
│   │   ├── admin/         # Admin components
│   │   ├── Hero.tsx       # Hero section
│   │   ├── Navbar.tsx     # Navigation
│   │   └── ...
│   └── lib/               # Utilities and configs
│       ├── api-error.ts   # Error handling
│       ├── auth.ts        # Auth config
│       ├── auth-utils.ts  # Auth utilities
│       ├── env.ts         # Environment validation
│       ├── logger.ts      # Logging utility
│       ├── metadata.ts    # SEO metadata
│       └── prisma.ts      # Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Database migrations
│   └── seed.js           # Seed script
├── sanity/
│   └── schemas/          # Sanity CMS schemas
├── tests/                # Test files
│   ├── lib/             # Library tests
│   └── app/             # Component tests
├── public/              # Static assets
└── docs/                # Additional documentation
```

## 📚 Documentation

- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Security Policy](SECURITY.md)** - Security guidelines and reporting

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (interactive)
npm run test:ui
```

### Test Structure

```
tests/
├── lib/
│   ├── auth-utils.test.ts
│   └── api-error.test.ts
└── app/
    └── not-found.test.tsx
```

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
npm run type-check       # TypeScript type checking
npm run studio           # Start Sanity Studio
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database
```

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DSNOUSE/dprideinternationalschool)

1. Click the button above
2. Configure environment variables
3. Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions including:
- Self-hosted deployment (VPS)
- Docker deployment
- Database setup
- SSL configuration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

Security is a top priority. Please see our [Security Policy](SECURITY.md) for:
- Reporting vulnerabilities
- Security best practices
- Known security considerations

**Never commit secrets or credentials!**

## 📋 Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXTAUTH_SECRET` | NextAuth secret (min 32 chars) | Generated via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | `abc123xyz` |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset | `production` |

See [env.example](env.example) for a complete list.

## 🐛 Troubleshooting

### Common Issues

**"Missing required environment variable"**
- Ensure all required variables in `.env` are set
- Check `.env` file is not in `.gitignore`

**"Prisma Client is not generated"**
```bash
npx prisma generate
```

**"Database connection failed"**
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

**"Login fails"**
- Re-run seed script with correct credentials
- Verify user has Administrator role

For more help, see [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting) or open an [issue](https://github.com/DSNOUSE/dprideinternationalschool/issues).

## 📊 Project Status

- ✅ Core functionality implemented
- ✅ Security hardened
- ✅ Testing infrastructure in place
- ✅ Documentation complete
- 🏗️ Additional features in development

## 🙏 Acknowledgments

- School leadership for project vision
- Open source community for amazing tools
- Contributors for their valuable input

## 📞 Contact

- **Website**: [https://dprideschools.com](https://dprideschools.com)
- **Email**: info@dprideschools.com
- **Phone**: 09037512828, 08135967785

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ by the DPRIDE International School team
</div>
