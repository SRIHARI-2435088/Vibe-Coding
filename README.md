# Knowledge Transfer Automation Tool (KTAT)

## 🎯 Project Overview

A comprehensive knowledge transfer automation tool designed to capture, organize, and share critical project knowledge during team transitions. Built with modern web technologies for scalability and user experience.

## 🏗️ Technology Stack

- **Frontend**: React.js + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Package Manager**: npm

## 📁 Project Structure

```
knowledge-transfer-tool/
├── README.md
├── .gitignore
├── .env.example
├── package.json (root workspace)
├── docs/
├── frontend/          # React frontend application
├── backend/           # Express.js API server
└── shared/            # Shared types and utilities
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd knowledge-transfer-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 📖 Documentation

- [Business Requirements Document](./BRD-README.md)
- [Coding Standards](./CODING-STANDARDS.md)
- [Priority Tasks](./PRIORITY-TASKS.md)
- [API Documentation](./docs/api/)

## 🚀 Development Commands

### Root Level
- `npm install` - Install all dependencies
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both applications
- `npm run test` - Run all tests

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build production
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 MVP Features

- ✅ User authentication and management
- ✅ Knowledge item creation and editing
- ✅ File upload and management
- ✅ Video annotation system
- ✅ Search and discovery
- ✅ Project organization
- ✅ Collaboration features (comments, reviews)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow the coding standards in `CODING-STANDARDS.md`
3. Test your changes thoroughly
4. Submit a pull request

## 📄 License

This project is part of the Vibe Coding Competition. 