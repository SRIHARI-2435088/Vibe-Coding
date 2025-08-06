import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.videoAnnotation.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.knowledgeItem.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users with SYSTEM ROLES
  // SYSTEM ROLES: ADMIN, PROJECT_MANAGER, CONTRIBUTOR, VIEWER
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ktat.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN', // SYSTEM ROLE: Full system administration
      bio: 'System administrator with full access to manage the knowledge transfer platform.',
      expertiseAreas: JSON.stringify(['System Administration', 'DevOps', 'Security']),
      isActive: true,
    },
  });

  const projectManager = await prisma.user.create({
    data: {
      email: 'pm@ktat.com',
      username: 'projectmanager',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: hashedPassword,
      role: 'PROJECT_MANAGER', // SYSTEM ROLE: Can create and manage projects
      bio: 'Experienced project manager with expertise in agile methodologies and team coordination.',
      expertiseAreas: JSON.stringify(['Project Management', 'Agile', 'Scrum', 'Team Leadership']),
      isActive: true,
    },
  });

  const developer1 = await prisma.user.create({
    data: {
      email: 'dev1@ktat.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      password: hashedPassword,
      role: 'CONTRIBUTOR', // SYSTEM ROLE: Can contribute content and participate in projects
      bio: 'Full-stack developer with expertise in React, Node.js, and cloud technologies.',
      expertiseAreas: JSON.stringify(['React', 'Node.js', 'TypeScript', 'AWS', 'Database Design']),
      isActive: true,
    },
  });

  const developer2 = await prisma.user.create({
    data: {
      email: 'dev2@ktat.com',
      username: 'janesmith',
      firstName: 'Jane',
      lastName: 'Smith',
      password: hashedPassword,
      role: 'CONTRIBUTOR', // SYSTEM ROLE: Can contribute content and participate in projects
      bio: 'Frontend specialist with strong UX/UI design skills and modern web technologies.',
      expertiseAreas: JSON.stringify(['Frontend Development', 'UI/UX Design', 'CSS', 'JavaScript']),
      isActive: true,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@ktat.com',
      username: 'viewer',
      firstName: 'Alice',
      lastName: 'Brown',
      password: hashedPassword,
      role: 'VIEWER', // SYSTEM ROLE: Read-only access to assigned projects
      bio: 'Business analyst and stakeholder representative.',
      expertiseAreas: JSON.stringify(['Business Analysis', 'Requirements Gathering', 'Documentation']),
      isActive: true,
    },
  });

  // Create pending users (inactive, awaiting approval)
  const pendingUser1 = await prisma.user.create({
    data: {
      email: 'pending1@example.com',
      username: 'newdev1',
      firstName: 'Mike',
      lastName: 'Wilson',
      password: hashedPassword,
      role: 'CONTRIBUTOR',
      bio: 'New developer looking to contribute to projects.',
      expertiseAreas: JSON.stringify(['JavaScript', 'React', 'Python']),
      isActive: false, // Pending approval
    },
  });

  const pendingUser2 = await prisma.user.create({
    data: {
      email: 'pending2@example.com',
      username: 'designerpro',
      firstName: 'Lisa',
      lastName: 'Chen',
      password: hashedPassword,
      role: 'CONTRIBUTOR',
      bio: 'UI/UX designer with 5 years of experience in design systems.',
      expertiseAreas: JSON.stringify(['UI/UX Design', 'Figma', 'Design Systems', 'Prototyping']),
      isActive: false, // Pending approval
    },
  });

  const pendingUser3 = await prisma.user.create({
    data: {
      email: 'pending3@example.com',
      username: 'dataanalyst',
      firstName: 'Robert',
      lastName: 'Davis',
      password: hashedPassword,
      role: 'VIEWER',
      bio: 'Data analyst interested in learning from project insights.',
      expertiseAreas: JSON.stringify(['Data Analysis', 'SQL', 'Business Intelligence']),
      isActive: false, // Pending approval
    },
  });

  console.log('✅ Created 5 active users + 3 pending users');

  // Create signup activities for pending users
  await prisma.activity.create({
    data: {
      type: 'USER_SIGNUP',
      description: `${pendingUser1.firstName} ${pendingUser1.lastName} registered and is pending approval`,
      userId: pendingUser1.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'USER_SIGNUP',
      description: `${pendingUser2.firstName} ${pendingUser2.lastName} registered and is pending approval`,
      userId: pendingUser2.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'USER_SIGNUP',
      description: `${pendingUser3.firstName} ${pendingUser3.lastName} registered and is pending approval`,
      userId: pendingUser3.id,
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'A modern e-commerce platform built with React and Node.js, featuring real-time inventory management and payment processing.',
      status: 'ACTIVE',
      clientName: 'TechRetail Corp',
      technology: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Redis', 'Stripe API', 'AWS']),
      startDate: new Date('2024-01-15'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application with biometric authentication and real-time transaction monitoring.',
      status: 'ACTIVE',
      clientName: 'SecureBank Ltd',
      technology: JSON.stringify(['React Native', 'Express.js', 'MongoDB', 'JWT', 'Biometric Auth']),
      startDate: new Date('2024-02-01'),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Analytics Dashboard',
      description: 'Business intelligence dashboard for data visualization and reporting with real-time analytics.',
      status: 'COMPLETED',
      clientName: 'DataInsights Inc',
      technology: JSON.stringify(['Vue.js', 'Python', 'FastAPI', 'ClickHouse', 'Docker']),
      startDate: new Date('2023-10-01'),
      endDate: new Date('2024-01-30'),
    },
  });

  console.log('✅ Created 3 projects');

  // Create project members
  // NOTE: These are PROJECT ROLES (not system roles)
  // PROJECT ROLES: LEAD, MEMBER, OBSERVER
  const projectMembers = [
    // E-Commerce Platform - Admin and PM as leads
    { userId: admin.id, projectId: project1.id, role: 'LEAD' },
    { userId: projectManager.id, projectId: project1.id, role: 'LEAD' },
    { userId: developer1.id, projectId: project1.id, role: 'MEMBER' },
    { userId: developer2.id, projectId: project1.id, role: 'MEMBER' },
    { userId: viewer.id, projectId: project1.id, role: 'OBSERVER' },

    // Mobile Banking App - PM as lead
    { userId: projectManager.id, projectId: project2.id, role: 'LEAD' },
    { userId: developer1.id, projectId: project2.id, role: 'MEMBER' },
    { userId: viewer.id, projectId: project2.id, role: 'OBSERVER' },

    // Analytics Dashboard - Admin as lead (completed project)
    { userId: admin.id, projectId: project3.id, role: 'LEAD' },
    { userId: developer2.id, projectId: project3.id, role: 'MEMBER' },
  ];

  for (const member of projectMembers) {
    await prisma.projectMember.create({
      data: member,
    });
  }

  console.log('✅ Created project members');

  // Create knowledge items
  const knowledgeItems = [
    {
      title: 'React Component Architecture Guidelines',
      description: 'Best practices for organizing and structuring React components in large applications.',
      content: `# React Component Architecture Guidelines

## Overview
This document outlines the best practices for organizing React components in our applications.

## Component Structure
- Use functional components with hooks
- Implement proper prop typing with TypeScript
- Keep components small and focused on single responsibility
- Use custom hooks for reusable logic

## File Organization
\`\`\`
components/
├── ui/           # Reusable UI components
├── layout/       # Layout components
├── feature/      # Feature-specific components
└── common/       # Common utility components
\`\`\`

## Best Practices
1. Always use TypeScript for type safety
2. Implement proper error boundaries
3. Use React.memo for performance optimization
4. Follow consistent naming conventions`,
      type: 'TECHNICAL',
      category: 'Frontend Development',
      tags: JSON.stringify(['React', 'Architecture', 'Best Practices', 'TypeScript']),
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer2.id,
      projectId: project1.id,
      publishedAt: new Date(),
    },
    {
      title: 'Database Migration Strategy',
      description: 'Step-by-step guide for handling database schema changes in production environments.',
      content: `# Database Migration Strategy

## Planning Phase
1. **Assess Impact**: Analyze the scope of schema changes
2. **Backup Strategy**: Ensure comprehensive backup before migration
3. **Testing**: Test migrations in staging environment

## Migration Types
- **Additive**: Adding new tables/columns (low risk)
- **Destructive**: Removing/modifying existing structures (high risk)
- **Data Migration**: Moving data between structures

## Best Practices
- Always use transactions for atomic operations
- Create rollback scripts for every migration
- Monitor performance impact during migration
- Communicate with stakeholders about downtime

## Tools
- Prisma Migrate for schema versioning
- Custom scripts for data transformations
- Monitoring tools for performance tracking`,
      type: 'TECHNICAL',
      category: 'Backend Development',
      tags: JSON.stringify(['Database', 'Prisma', 'Migration', 'Production']),
      difficulty: 'ADVANCED',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer1.id,
      projectId: project1.id,
      publishedAt: new Date(),
    },
    {
      title: 'Project Onboarding Checklist',
      description: 'Comprehensive checklist for new team members joining ongoing projects.',
      content: `# Project Onboarding Checklist

## Pre-boarding (HR/Admin)
- [ ] Provide access credentials and accounts
- [ ] Set up development environment
- [ ] Schedule introduction meetings

## Technical Setup
- [ ] Clone project repositories
- [ ] Install required dependencies
- [ ] Configure local development environment
- [ ] Run initial tests to verify setup

## Knowledge Transfer
- [ ] Review project documentation
- [ ] Understand business requirements
- [ ] Learn about system architecture
- [ ] Study coding standards and practices

## Team Integration
- [ ] Meet with project manager
- [ ] Introduction to team members
- [ ] Understand team communication protocols
- [ ] Schedule regular check-ins

## First Week Goals
- [ ] Complete assigned starter tasks
- [ ] Ask questions and seek clarification
- [ ] Provide feedback on onboarding process`,
      type: 'PROCESS',
      category: 'Team Management',
      tags: JSON.stringify(['Onboarding', 'Process', 'Team Management', 'Checklist']),
      difficulty: 'BEGINNER',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: projectManager.id,
      projectId: project1.id,
      publishedAt: new Date(),
    },
    {
      title: 'API Security Best Practices',
      description: 'Essential security practices for building secure APIs and protecting sensitive data.',
      content: `# API Security Best Practices

## Authentication & Authorization
- Implement JWT tokens with proper expiration
- Use OAuth 2.0 for third-party integrations
- Apply role-based access control (RBAC)
- Validate tokens on every request

## Data Protection
- Use HTTPS for all API communications
- Implement request/response encryption
- Sanitize all input data
- Apply rate limiting to prevent abuse

## Common Vulnerabilities
1. **SQL Injection**: Use parameterized queries
2. **XSS**: Sanitize output and validate input
3. **CSRF**: Implement CSRF tokens
4. **Broken Authentication**: Strong password policies

## Monitoring & Logging
- Log all security events
- Monitor for suspicious activities
- Implement real-time alerts
- Regular security audits`,
      type: 'TECHNICAL',
      category: 'Security',
      tags: JSON.stringify(['Security', 'API', 'Authentication', 'Best Practices']),
      difficulty: 'ADVANCED',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer1.id,
      projectId: project2.id,
      publishedAt: new Date(),
    },
    {
      title: 'Client Communication Guidelines',
      description: 'Best practices for effective communication with clients throughout project lifecycle.',
      content: `# Client Communication Guidelines

## Communication Principles
- **Transparency**: Keep clients informed about progress and challenges
- **Timeliness**: Respond to client inquiries within 24 hours
- **Clarity**: Use clear, non-technical language when appropriate
- **Documentation**: Keep written records of all important decisions

## Meeting Management
- Prepare agendas in advance
- Share meeting notes within 24 hours
- Define clear action items and owners
- Schedule regular check-ins and demos

## Reporting Structure
- Weekly status reports with progress updates
- Monthly project reviews with stakeholders
- Immediate notification of any blockers or risks
- Quarterly business reviews for strategic alignment

## Escalation Process
1. Project Manager handles day-to-day issues
2. Senior Leadership for budget/scope changes
3. Executive team for critical decisions
4. Legal team for contract modifications`,
      type: 'BUSINESS',
      category: 'Client Management',
      tags: JSON.stringify(['Communication', 'Client Management', 'Project Management', 'Process']),
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: projectManager.id,
      projectId: project2.id,
      publishedAt: new Date(),
    },
  ];

  for (const item of knowledgeItems) {
    await prisma.knowledgeItem.create({
      data: item,
    });
  }

  console.log('✅ Created 5 knowledge items');

  // Create some sample comments and reviews
  const knowledgeItemsList = await prisma.knowledgeItem.findMany();

  // Add comments
  for (const item of knowledgeItemsList.slice(0, 3)) {
    await prisma.comment.create({
      data: {
        content: 'Great documentation! This will be very helpful for new team members.',
        authorId: viewer.id,
        knowledgeItemId: item.id,
      },
    });

    await prisma.comment.create({
      data: {
        content: 'Could we add some code examples to illustrate the concepts better?',
        authorId: developer1.id,
        knowledgeItemId: item.id,
      },
    });
  }

  // Add reviews
  for (const item of knowledgeItemsList) {
    await prisma.review.create({
      data: {
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        feedback: 'Excellent knowledge sharing. Well structured and informative.',
        reviewerId: developer1.id,
        knowledgeItemId: item.id,
      },
    });
  }

  console.log('✅ Created comments and reviews');

  // Create activity logs
  const activities = [
    { type: 'CREATED', description: 'Created React component guidelines', userId: developer2.id, knowledgeItemId: knowledgeItemsList[0].id },
    { type: 'UPDATED', description: 'Updated database migration documentation', userId: developer1.id, knowledgeItemId: knowledgeItemsList[1].id },
    { type: 'REVIEWED', description: 'Reviewed onboarding checklist', userId: projectManager.id, knowledgeItemId: knowledgeItemsList[2].id },
    { type: 'SHARED', description: 'Shared API security guidelines with team', userId: developer1.id, knowledgeItemId: knowledgeItemsList[3].id },
    { type: 'VIEWED', description: 'Viewed client communication guidelines', userId: viewer.id, knowledgeItemId: knowledgeItemsList[4].id },
  ];

  for (const activity of activities) {
    await prisma.activity.create({
      data: activity,
    });
  }

  console.log('✅ Created activity logs');

  console.log('🌱 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${await prisma.user.count()}`);
  console.log(`- Projects: ${await prisma.project.count()}`);
  console.log(`- Knowledge Items: ${await prisma.knowledgeItem.count()}`);
  console.log(`- Comments: ${await prisma.comment.count()}`);
  console.log(`- Reviews: ${await prisma.review.count()}`);
  console.log(`- Activities: ${await prisma.activity.count()}`);
  
  console.log('\n🔑 Demo Accounts:');
  console.log('Admin: admin@ktat.com / password123 (SYSTEM: ADMIN)');
  console.log('Project Manager: pm@ktat.com / password123 (SYSTEM: PROJECT_MANAGER)');
  console.log('Developer 1: dev1@ktat.com / password123 (SYSTEM: CONTRIBUTOR)');
  console.log('Developer 2: dev2@ktat.com / password123 (SYSTEM: CONTRIBUTOR)');
  console.log('Viewer: viewer@ktat.com / password123 (SYSTEM: VIEWER)');
  
  console.log('\n📋 Role System:');
  console.log('🏢 SYSTEM ROLES (users.role):');
  console.log('  - ADMIN: Full system administration');
  console.log('  - PROJECT_MANAGER: Can create and manage projects');
  console.log('  - CONTRIBUTOR: Can contribute content and participate');
  console.log('  - VIEWER: Read-only access to assigned projects');
  console.log('📁 PROJECT ROLES (project_members.role):');
  console.log('  - LEAD: Project leader (can manage project)');
  console.log('  - MEMBER: Active project member');
  console.log('  - OBSERVER: View-only in project');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 