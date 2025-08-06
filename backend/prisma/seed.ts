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

  const project4 = await prisma.project.create({
    data: {
      name: 'DevOps Automation Pipeline',
      description: 'CI/CD pipeline implementation with automated testing, deployment, and monitoring for microservices architecture.',
      status: 'ACTIVE',
      clientName: 'CloudTech Solutions',
      technology: JSON.stringify(['Jenkins', 'Docker', 'Kubernetes', 'AWS', 'Terraform', 'Prometheus']),
      startDate: new Date('2024-03-01'),
    },
  });

  const project5 = await prisma.project.create({
    data: {
      name: 'Healthcare Management System',
      description: 'Comprehensive healthcare management platform with patient records, appointment scheduling, and telemedicine features.',
      status: 'ACTIVE',
      clientName: 'MedCare Hospital Group',
      technology: JSON.stringify(['Next.js', 'NestJS', 'PostgreSQL', 'Socket.io', 'HIPAA Compliance']),
      startDate: new Date('2024-01-10'),
    },
  });

  const project6 = await prisma.project.create({
    data: {
      name: 'IoT Sensor Network',
      description: 'Internet of Things platform for collecting, processing, and analyzing sensor data from industrial equipment.',
      status: 'PLANNING',
      clientName: 'Industrial Automation Corp',
      technology: JSON.stringify(['Python', 'MQTT', 'InfluxDB', 'Grafana', 'Edge Computing', 'Machine Learning']),
      startDate: new Date('2024-05-01'),
    },
  });

  const project7 = await prisma.project.create({
    data: {
      name: 'Social Learning Platform',
      description: 'Educational platform with interactive courses, video lectures, peer-to-peer learning, and progress tracking.',
      status: 'COMPLETED',
      clientName: 'EduTech Innovations',
      technology: JSON.stringify(['Angular', 'Spring Boot', 'MySQL', 'WebRTC', 'S3', 'Elastic Search']),
      startDate: new Date('2023-08-01'),
      endDate: new Date('2024-02-15'),
    },
  });

  console.log('✅ Created 7 projects');

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
      description: 'Comprehensive guide for structuring React components in large-scale applications.',
      content: `# React Component Architecture Guidelines

## Component Structure
When building React applications, proper component architecture is crucial for maintainability and scalability.

\`\`\`jsx
// Good component structure
const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSave = useCallback((userData) => {
    onUpdate(userData);
    setIsEditing(false);
  }, [onUpdate]);

  return (
    <div className="user-profile">
      {isEditing ? (
        <UserEditForm user={user} onSave={handleSave} />
      ) : (
        <UserDisplay user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
};
\`\`\`

## Folder Organization
\`\`\`
src/
├── components/
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
- Use refresh tokens for session management
- Apply role-based access control (RBAC)
- Validate all incoming requests

## Data Protection
- Always use HTTPS in production
- Encrypt sensitive data at rest
- Implement proper input validation
- Use parameterized queries to prevent SQL injection

## Rate Limiting & Monitoring
- Implement rate limiting per user/IP
- Log all API requests and responses
- Monitor for suspicious activities
- Set up alerts for security incidents

## Common Vulnerabilities
1. **OWASP Top 10** - Stay updated with latest threats
2. **CORS Configuration** - Properly configure cross-origin requests
3. **Error Handling** - Don't expose sensitive information in errors
4. **Dependencies** - Regularly update and audit npm packages`,
      type: 'TECHNICAL',
      category: 'Security',
      tags: JSON.stringify(['Security', 'API', 'Authentication', 'OWASP']),
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
- **Proactive Updates**: Don't wait for clients to ask for status updates
- **Clear Documentation**: Document all decisions and changes
- **Regular Rhythm**: Establish consistent meeting schedules

## Project Kickoff
- Conduct thorough requirements gathering sessions
- Define clear project scope and deliverables
- Establish communication protocols and preferred channels
- Set expectations for response times and availability

## Ongoing Communication
- Weekly status reports with accomplishments and next steps
- Bi-weekly demo sessions to showcase progress
- Monthly steering committee meetings for strategic decisions
- Immediate escalation for any blockers or scope changes

## Crisis Communication
- Notify clients immediately of any critical issues
- Provide realistic timelines for resolution
- Offer alternative solutions when possible
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
    {
      title: 'Docker Containerization Guide',
      description: 'Complete guide to containerizing applications with Docker and Docker Compose.',
      content: `# Docker Containerization Guide

## Why Docker?
Docker enables consistent environments across development, testing, and production, eliminating "it works on my machine" issues.

## Basic Dockerfile Structure
\`\`\`dockerfile
# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Define startup command
CMD ["npm", "start"]
\`\`\`

## Multi-stage Builds
\`\`\`dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
CMD ["npm", "start"]
\`\`\`

## Docker Compose for Development
\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
  
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

## Best Practices
1. Use specific version tags, not 'latest'
2. Minimize image layers
3. Use .dockerignore to exclude unnecessary files
4. Run containers as non-root user
5. Use health checks for container monitoring`,
      type: 'TECHNICAL',
      category: 'DevOps',
      tags: JSON.stringify(['Docker', 'Containerization', 'DevOps', 'Deployment']),
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer1.id,
      projectId: project4.id,
      publishedAt: new Date(),
    },
    {
      title: 'Kubernetes Deployment Strategies',
      description: 'Advanced strategies for deploying and managing applications in Kubernetes clusters.',
      content: `# Kubernetes Deployment Strategies

## Rolling Updates
The default strategy for zero-downtime deployments.

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:v2.0
        ports:
        - containerPort: 8080
\`\`\`

## Blue-Green Deployments
Complete environment switch for instant rollbacks.

\`\`\`yaml
# Blue environment (current)
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
    version: blue
  ports:
    - port: 80
      targetPort: 8080

---
# Green environment (new)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
      version: green
\`\`\`

## Canary Deployments
Gradual traffic shifting to new versions.

\`\`\`yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 1m}
      - setWeight: 50
      - pause: {duration: 2m}
      - setWeight: 100
\`\`\`

## Monitoring and Observability
- Use Prometheus for metrics collection
- Implement health checks and readiness probes
- Set up logging with ELK stack or similar
- Configure alerts for deployment failures

## Best Practices
1. Always use resource limits and requests
2. Implement proper health checks
3. Use namespaces for environment isolation
4. Version your deployments properly
5. Have rollback procedures ready`,
      type: 'TECHNICAL',
      category: 'DevOps',
      tags: JSON.stringify(['Kubernetes', 'Deployment', 'CI/CD', 'Orchestration']),
      difficulty: 'ADVANCED',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer2.id,
      projectId: project4.id,
      publishedAt: new Date(),
    },
    {
      title: 'Healthcare Data Privacy Compliance',
      description: 'HIPAA compliance requirements and implementation strategies for healthcare applications.',
      content: `# Healthcare Data Privacy Compliance

## HIPAA Compliance Basics
The Health Insurance Portability and Accountability Act (HIPAA) sets standards for protecting sensitive patient data.

## Technical Safeguards
### Access Control
- Unique user identification for each person
- Emergency access procedures
- Automatic logoff mechanisms
- Encryption and decryption procedures

\`\`\`javascript
// Example: Secure user authentication
const authenticateUser = async (credentials) => {
  const hashedPassword = await bcrypt.hash(credentials.password, 12);
  const user = await User.findOne({ 
    email: credentials.email,
    isActive: true 
  });
  
  if (!user || !await bcrypt.compare(credentials.password, user.password)) {
    // Log failed attempt
    await logSecurityEvent('FAILED_LOGIN', credentials.email);
    throw new Error('Invalid credentials');
  }
  
  // Log successful login
  await logSecurityEvent('SUCCESSFUL_LOGIN', user.id);
  return generateJWT(user);
};
\`\`\`

## Data Encryption
### At Rest
- Database encryption using AES-256
- File system encryption
- Backup encryption

### In Transit
- TLS 1.3 for all communications
- VPN for internal network traffic
- Certificate pinning for mobile apps

\`\`\`javascript
// Example: Encrypting sensitive fields
const encryptPHI = (data) => {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.PHI_ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    data: encrypted,
    tag: cipher.getAuthTag()
  };
};
\`\`\`

## Audit Logging
Every access to PHI must be logged:
- User identification
- Date and time of access
- Type of action performed
- Patient record accessed

\`\`\`javascript
const logPHIAccess = async (userId, patientId, action) => {
  await AuditLog.create({
    userId,
    patientId,
    action,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
};
\`\`\`

## Administrative Safeguards
1. **Security Officer**: Designate a HIPAA security officer
2. **Training**: Regular staff training on privacy policies
3. **Access Management**: Role-based access controls
4. **Incident Response**: Procedures for security breaches

## Physical Safeguards
- Secure server rooms with access controls
- Workstation security measures
- Device and media controls
- Facility access controls

## Business Associate Agreements (BAAs)
All third-party vendors handling PHI must sign BAAs:
- Cloud providers (AWS, Azure, GCP)
- Analytics services
- Email providers
- Backup services

## Compliance Checklist
- [ ] Conduct risk assessment
- [ ] Implement technical safeguards
- [ ] Train all staff on HIPAA requirements
- [ ] Establish incident response procedures
- [ ] Sign BAAs with all vendors
- [ ] Regular compliance audits`,
      type: 'BUSINESS',
      category: 'Compliance',
      tags: JSON.stringify(['HIPAA', 'Healthcare', 'Compliance', 'Privacy', 'Security']),
      difficulty: 'ADVANCED',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: projectManager.id,
      projectId: project5.id,
      publishedAt: new Date(),
    },
    {
      title: 'IoT Data Pipeline Architecture',
      description: 'Scalable architecture patterns for processing high-volume IoT sensor data in real-time.',
      content: `# IoT Data Pipeline Architecture

## System Overview
Processing millions of sensor readings per second requires careful architectural planning.

## Data Ingestion Layer
### MQTT Broker Setup
\`\`\`python
import paho.mqtt.client as mqtt
import json
from datetime import datetime

class IoTDataCollector:
    def __init__(self, broker_host, broker_port=1883):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(broker_host, broker_port, 60)
    
    def on_connect(self, client, userdata, flags, rc):
        print(f"Connected with result code {rc}")
        client.subscribe("sensors/+/data")
    
    def on_message(self, client, userdata, msg):
        try:
            sensor_data = json.loads(msg.payload.decode())
            sensor_data['timestamp'] = datetime.utcnow().isoformat()
            sensor_data['topic'] = msg.topic
            
            # Send to processing pipeline
            self.process_sensor_data(sensor_data)
        except Exception as e:
            print(f"Error processing message: {e}")
\`\`\`

## Stream Processing
### Apache Kafka Integration
\`\`\`python
from kafka import KafkaProducer, KafkaConsumer
import json

class SensorDataProcessor:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda x: json.dumps(x).encode('utf-8')
        )
    
    def process_sensor_data(self, data):
        # Data validation
        if self.validate_sensor_data(data):
            # Enrich with metadata
            enriched_data = self.enrich_data(data)
            
            # Send to appropriate topic based on sensor type
            topic = f"processed-{data['sensor_type']}"
            self.producer.send(topic, enriched_data)
    
    def validate_sensor_data(self, data):
        required_fields = ['sensor_id', 'value', 'timestamp']
        return all(field in data for field in required_fields)
\`\`\`

## Time Series Database Storage
### InfluxDB Implementation
\`\`\`python
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

class TimeSeriesStorage:
    def __init__(self, url, token, org, bucket):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.bucket = bucket
        self.org = org
    
    def store_sensor_data(self, sensor_data):
        point = Point("sensor_reading") \\
            .tag("sensor_id", sensor_data['sensor_id']) \\
            .tag("location", sensor_data.get('location', 'unknown')) \\
            .field("value", float(sensor_data['value'])) \\
            .field("quality", sensor_data.get('quality', 1.0)) \\
            .time(sensor_data['timestamp'])
        
        self.write_api.write(bucket=self.bucket, org=self.org, record=point)
\`\`\`

## Real-time Analytics
### Anomaly Detection
\`\`\`python
import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self, contamination=0.1):
        self.model = IsolationForest(contamination=contamination)
        self.is_trained = False
    
    def train(self, training_data):
        features = np.array([[d['value']] for d in training_data])
        self.model.fit(features)
        self.is_trained = True
    
    def detect_anomaly(self, sensor_reading):
        if not self.is_trained:
            return False
        
        prediction = self.model.predict([[sensor_reading['value']]])
        return prediction[0] == -1  # -1 indicates anomaly
\`\`\`

## Edge Computing Integration
### Local Processing Node
\`\`\`python
class EdgeProcessor:
    def __init__(self, node_id):
        self.node_id = node_id
        self.local_cache = {}
        self.anomaly_detector = AnomalyDetector()
    
    def process_local_data(self, sensor_data):
        # Local preprocessing
        filtered_data = self.apply_filters(sensor_data)
        
        # Check for anomalies locally
        if self.anomaly_detector.detect_anomaly(filtered_data):
            self.send_alert(filtered_data)
        
        # Aggregate data before sending to cloud
        self.update_local_cache(filtered_data)
        
        # Send aggregated data every minute
        if self.should_send_aggregate():
            self.send_aggregate_to_cloud()
\`\`\`

## Monitoring and Alerting
### System Health Metrics
- Message throughput (messages/second)
- Processing latency (end-to-end)
- Data quality metrics
- System resource utilization

### Grafana Dashboard Setup
\`\`\`sql
-- InfluxDB query for real-time monitoring
SELECT mean("value") as avg_value, 
       max("value") as max_value,
       min("value") as min_value
FROM "sensor_reading" 
WHERE time >= now() - 1h 
GROUP BY time(1m), "sensor_id"
\`\`\`

## Scalability Considerations
1. **Horizontal Scaling**: Use Kafka partitioning
2. **Load Balancing**: Distribute MQTT connections
3. **Data Retention**: Implement tiered storage
4. **Compression**: Use efficient data formats (Protobuf, Avro)
5. **Caching**: Redis for frequently accessed data

## Security Measures
- TLS encryption for all communications
- Device authentication using certificates
- Network segmentation for IoT devices
- Regular security audits and updates`,
      type: 'TECHNICAL',
      category: 'IoT',
      tags: JSON.stringify(['IoT', 'Data Pipeline', 'Real-time', 'MQTT', 'InfluxDB', 'Analytics']),
      difficulty: 'ADVANCED',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer2.id,
      projectId: project6.id,
      publishedAt: new Date(),
    },
    {
      title: 'Agile Sprint Planning Workshop',
      description: 'Step-by-step guide to conducting effective sprint planning sessions with distributed teams.',
      content: `# Agile Sprint Planning Workshop

## Pre-Planning Preparation
### Backlog Refinement
Ensure the product backlog is well-groomed before sprint planning:
- User stories are clearly defined
- Acceptance criteria are documented
- Stories are estimated using story points
- Dependencies are identified

### Team Capacity Planning
\`\`\`
Sprint Capacity = (Team Size × Sprint Length × Focus Factor) - Planned Absences

Example:
- Team Size: 6 developers
- Sprint Length: 10 working days
- Focus Factor: 0.8 (80% productive time)
- Planned Absences: 2 days
- Capacity: (6 × 10 × 0.8) - 2 = 46 story points
\`\`\`

## Sprint Planning Meeting Structure
### Part 1: What (2 hours)
1. **Sprint Goal Definition** (30 minutes)
   - Review business objectives
   - Define measurable sprint goal
   - Align team on priorities

2. **Story Selection** (90 minutes)
   - Product Owner presents highest priority stories
   - Team asks clarifying questions
   - Select stories that fit within capacity

### Part 2: How (2 hours)
1. **Task Breakdown** (90 minutes)
   - Break down user stories into technical tasks
   - Estimate effort for each task
   - Identify technical dependencies

2. **Commitment** (30 minutes)
   - Team commits to sprint backlog
   - Final capacity check
   - Risk identification and mitigation

## Distributed Team Considerations
### Technology Setup
- Use collaborative tools (Jira, Azure DevOps)
- Video conferencing with screen sharing
- Digital estimation tools (Planning Poker)
- Virtual whiteboarding (Miro, Mural)

### Time Zone Management
\`\`\`
Planning Schedule for Global Team:
- US East Coast: 9:00 AM
- UK: 2:00 PM  
- India: 6:30 PM
- Australia: Next day 12:00 AM (rotate participation)
\`\`\`

## Story Estimation Techniques
### Planning Poker
1. Product Owner reads user story
2. Team discusses requirements and risks
3. Each member privately selects estimate
4. Reveal estimates simultaneously
5. Discuss differences and re-estimate

### T-Shirt Sizing
For high-level estimation:
- XS: 1-2 story points
- S: 3-5 story points  
- M: 8 story points
- L: 13 story points
- XL: 20+ story points (needs breakdown)

## Common Anti-Patterns to Avoid
1. **Over-commitment**: Taking on too much work
2. **Under-planning**: Not breaking down stories enough
3. **Scope Creep**: Adding work during the sprint
4. **Weak Definition of Done**: Unclear completion criteria
5. **Missing Dependencies**: Not identifying blockers

## Sprint Planning Checklist
### Before the Meeting
- [ ] Product backlog is refined and prioritized
- [ ] Team capacity is calculated
- [ ] Meeting logistics are confirmed
- [ ] Previous sprint retrospective items are reviewed

### During the Meeting
- [ ] Sprint goal is clearly defined
- [ ] Stories are well understood by the team
- [ ] Tasks are broken down appropriately
- [ ] Estimates are realistic and agreed upon
- [ ] Dependencies and risks are identified

### After the Meeting
- [ ] Sprint backlog is updated in project management tool
- [ ] Task assignments are clear
- [ ] Sprint goal is communicated to stakeholders
- [ ] Daily standup schedule is confirmed

## Measuring Success
### Sprint Planning Metrics
- Planning meeting duration vs. target
- Story point estimation accuracy
- Sprint goal achievement rate
- Team satisfaction with planning process

### Velocity Tracking
\`\`\`
Sprint 1: 23 points committed, 21 points completed (91%)
Sprint 2: 25 points committed, 25 points completed (100%)
Sprint 3: 27 points committed, 24 points completed (89%)

Average Velocity: 23.3 points per sprint
\`\`\`

## Continuous Improvement
- Collect feedback after each planning session
- Adjust meeting format based on team needs
- Experiment with different estimation techniques
- Regular retrospectives on planning effectiveness`,
      type: 'PROCESS',
      category: 'Project Management',
      tags: JSON.stringify(['Agile', 'Sprint Planning', 'Scrum', 'Team Management', 'Estimation']),
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: projectManager.id,
      projectId: project7.id,
      publishedAt: new Date(),
    },
    {
      title: 'Machine Learning Model Deployment',
      description: 'Production deployment strategies for ML models with monitoring and rollback capabilities.',
      content: `# Machine Learning Model Deployment

## Model Deployment Pipeline
### Model Packaging
\`\`\`python
import joblib
import mlflow
from datetime import datetime

class ModelPackager:
    def __init__(self, model, metadata):
        self.model = model
        self.metadata = metadata
    
    def package_model(self):
        # Save model artifacts
        model_path = f"models/model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        joblib.dump(self.model, f"{model_path}/model.pkl")
        
        # Log with MLflow
        with mlflow.start_run():
            mlflow.sklearn.log_model(
                self.model, 
                "model",
                registered_model_name="production_model"
            )
            mlflow.log_params(self.metadata['hyperparameters'])
            mlflow.log_metrics(self.metadata['performance_metrics'])
        
        return model_path
\`\`\`

### Containerized Deployment
\`\`\`dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and inference code
COPY model/ ./model/
COPY src/ ./src/

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

## Model Serving with FastAPI
\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from typing import List
import logging

app = FastAPI(title="ML Model API", version="1.0.0")

# Load model at startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        model = joblib.load("model/model.pkl")
        logging.info("Model loaded successfully")
    except Exception as e:
        logging.error(f"Failed to load model: {e}")
        raise

class PredictionRequest(BaseModel):
    features: List[float]
    model_version: str = "1.0.0"

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_version: str

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        # Validate input
        if len(request.features) != model.n_features_in_:
            raise HTTPException(
                status_code=400, 
                detail=f"Expected {model.n_features_in_} features, got {len(request.features)}"
            )
        
        # Make prediction
        features = np.array(request.features).reshape(1, -1)
        prediction = model.predict(features)[0]
        
        # Calculate confidence (for models that support it)
        confidence = 0.95  # Placeholder
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(features)[0]
            confidence = max(probabilities)
        
        return PredictionResponse(
            prediction=float(prediction),
            confidence=float(confidence),
            model_version=request.model_version
        )
    
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
\`\`\`

## A/B Testing Framework
\`\`\`python
import random
from enum import Enum

class ModelVersion(Enum):
    MODEL_A = "model_a"
    MODEL_B = "model_b"

class ABTestManager:
    def __init__(self, traffic_split=0.5):
        self.traffic_split = traffic_split
        self.model_a = joblib.load("models/model_a.pkl")
        self.model_b = joblib.load("models/model_b.pkl")
    
    def get_model_assignment(self, user_id: str) -> ModelVersion:
        # Consistent assignment based on user_id hash
        hash_value = hash(user_id) % 100
        if hash_value < (self.traffic_split * 100):
            return ModelVersion.MODEL_A
        return ModelVersion.MODEL_B
    
    def predict_with_assignment(self, features, user_id):
        assignment = self.get_model_assignment(user_id)
        
        if assignment == ModelVersion.MODEL_A:
            prediction = self.model_a.predict(features)
            model_version = "A"
        else:
            prediction = self.model_b.predict(features)
            model_version = "B"
        
        # Log assignment for analysis
        self.log_assignment(user_id, assignment, prediction)
        
        return prediction, model_version
\`\`\`

## Model Monitoring
### Performance Tracking
\`\`\`python
import prometheus_client
from prometheus_client import Counter, Histogram, Gauge

# Metrics
PREDICTION_COUNTER = Counter('ml_predictions_total', 'Total predictions made')
PREDICTION_LATENCY = Histogram('ml_prediction_duration_seconds', 'Prediction latency')
MODEL_ACCURACY = Gauge('ml_model_accuracy', 'Current model accuracy')
DATA_DRIFT_SCORE = Gauge('ml_data_drift_score', 'Data drift detection score')

class ModelMonitor:
    def __init__(self):
        self.reference_data = None
        self.recent_predictions = []
    
    @PREDICTION_LATENCY.time()
    def monitor_prediction(self, features, prediction):
        PREDICTION_COUNTER.inc()
        
        # Check for data drift
        drift_score = self.calculate_drift(features)
        DATA_DRIFT_SCORE.set(drift_score)
        
        # Store recent predictions for accuracy calculation
        self.recent_predictions.append({
            'features': features,
            'prediction': prediction,
            'timestamp': datetime.now()
        })
        
        # Alert if drift is high
        if drift_score > 0.7:
            self.send_drift_alert(drift_score)
    
    def calculate_drift(self, features):
        # Simplified drift calculation using statistical tests
        if self.reference_data is None:
            return 0.0
        
        # Use KS test or similar statistical method
        from scipy.stats import ks_2samp
        _, p_value = ks_2samp(self.reference_data, features)
        return 1 - p_value  # Higher score = more drift
\`\`\`

## Blue-Green Deployment Strategy
\`\`\`yaml
# Kubernetes deployment for blue-green
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: ml-model-service
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: ml-model-active
      previewService: ml-model-preview
      prePromotionAnalysis:
        templates:
        - templateName: accuracy-check
        args:
        - name: service-name
          value: ml-model-preview
      autoPromotionEnabled: true
      scaleDownDelaySeconds: 30
  selector:
    matchLabels:
      app: ml-model
  template:
    metadata:
      labels:
        app: ml-model
    spec:
      containers:
      - name: ml-service
        image: ml-model:{{.Values.image.tag}}
        ports:
        - containerPort: 8000
\`\`\`

## Model Rollback Procedures
\`\`\`python
class ModelRollbackManager:
    def __init__(self):
        self.model_versions = {}
        self.current_version = None
    
    def register_model_version(self, version, model_path):
        self.model_versions[version] = model_path
    
    def rollback_to_version(self, target_version):
        if target_version not in self.model_versions:
            raise ValueError(f"Version {target_version} not found")
        
        # Load previous model
        model_path = self.model_versions[target_version]
        model = joblib.load(model_path)
        
        # Update current model
        self.current_model = model
        self.current_version = target_version
        
        # Log rollback event
        logging.info(f"Rolled back to model version {target_version}")
        return True
    
    def emergency_rollback(self):
        # Automatic rollback to last known good version
        if len(self.model_versions) > 1:
            versions = sorted(self.model_versions.keys(), reverse=True)
            last_good_version = versions[1]  # Second most recent
            return self.rollback_to_version(last_good_version)
        return False
\`\`\`

## Production Checklist
### Pre-Deployment
- [ ] Model performance validated on test set
- [ ] A/B testing framework configured
- [ ] Monitoring and alerting set up
- [ ] Rollback procedures tested
- [ ] Load testing completed

### Post-Deployment
- [ ] Model accuracy monitoring active
- [ ] Data drift detection running
- [ ] Performance metrics being collected
- [ ] Business metrics being tracked
- [ ] Incident response plan ready

## Continuous Learning Pipeline
- Collect prediction feedback
- Retrain models with new data
- Validate model improvements
- Deploy updated models using CI/CD
- Monitor for performance regression`,
      type: 'TECHNICAL',
      category: 'Machine Learning',
      tags: JSON.stringify(['Machine Learning', 'MLOps', 'Deployment', 'Monitoring', 'Production']),
      difficulty: 'ADVANCED',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer2.id,
      projectId: project6.id,
      publishedAt: new Date(),
    },
    {
      title: 'Code Review Best Practices',
      description: 'Comprehensive guide to conducting effective code reviews that improve code quality and team knowledge sharing.',
      content: `# Code Review Best Practices

## Purpose of Code Reviews
Code reviews serve multiple purposes beyond just catching bugs:
- Knowledge sharing across team members
- Maintaining code quality and consistency
- Mentoring junior developers
- Ensuring architectural alignment
- Reducing technical debt

## Pre-Review Checklist
### For Authors
- [ ] Code follows team coding standards
- [ ] All tests pass locally
- [ ] Self-review completed
- [ ] Documentation updated if needed
- [ ] PR description is clear and complete

### For Reviewers
- [ ] Understand the context and requirements
- [ ] Review the PR description and acceptance criteria
- [ ] Check out the branch locally if needed
- [ ] Plan sufficient time for thorough review

## What to Look For
### Code Quality
\`\`\`javascript
// ❌ Poor: Unclear variable names and logic
function calc(x, y) {
  if (x > 0) {
    if (y > 0) {
      return x * y * 1.2;
    }
    return x * y;
  }
  return 0;
}

// ✅ Good: Clear intent and readable code
function calculateOrderTotal(quantity, unitPrice) {
  if (quantity <= 0 || unitPrice <= 0) {
    return 0;
  }
  
  const subtotal = quantity * unitPrice;
  const taxRate = 0.2; // 20% tax rate
  
  return subtotal * (1 + taxRate);
}
\`\`\`

### Security Considerations
\`\`\`javascript
// ❌ Poor: SQL injection vulnerability
const getUserById = (id) => {
  return db.query(\`SELECT * FROM users WHERE id = \${id}\`);
};

// ✅ Good: Parameterized query
const getUserById = (id) => {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
};
\`\`\`

### Performance Issues
\`\`\`javascript
// ❌ Poor: N+1 query problem
const getOrdersWithCustomers = async (orderIds) => {
  const orders = await Order.findByIds(orderIds);
  
  for (const order of orders) {
    order.customer = await Customer.findById(order.customerId);
  }
  
  return orders;
};

// ✅ Good: Batch loading
const getOrdersWithCustomers = async (orderIds) => {
  const orders = await Order.findByIds(orderIds)
    .populate('customer'); // Load customers in single query
  
  return orders;
};
\`\`\`

## Review Comments Guidelines
### Constructive Feedback
\`\`\`
❌ "This is wrong"
✅ "Consider using Array.map() here instead of forEach() since we're 
   creating a new array. It better expresses the intent."

❌ "Bad variable name"
✅ "Could we use a more descriptive name like 'userPreferences' 
   instead of 'data'? It would make the code more self-documenting."
\`\`\`

### Using Conventional Comments
- **nitpick**: Minor style or preference issue
- **suggestion**: Optional improvement
- **issue**: Problem that should be addressed
- **question**: Seeking clarification
- **praise**: Positive feedback

\`\`\`
nitpick: Consider adding a trailing comma for consistency

suggestion: We could extract this logic into a separate utility function
for reusability

issue: This will throw an error if user.profile is null

question: Should we handle the case where the API returns an empty array?

praise: Great use of TypeScript generics here!
\`\`\`

## Review Process Workflow
### Small PRs (< 400 lines)
1. **Same-day review**: Aim to review within 24 hours
2. **Single reviewer**: One thorough review is often sufficient
3. **Quick turnaround**: Author responds to feedback within 1-2 days

### Large PRs (> 400 lines)
1. **Break down**: Consider splitting into smaller PRs
2. **Multiple reviewers**: Different perspectives catch more issues
3. **Staged review**: Review architecture first, then implementation
4. **Extended timeline**: Allow more time for thorough review

## Automated Checks Integration
### Pre-review Automation
\`\`\`yaml
# GitHub Actions workflow
name: Code Quality Checks
on: [pull_request]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Check test coverage
        run: npm run test:coverage
        
      - name: Security audit
        run: npm audit
        
      - name: Type checking
        run: npm run type-check
\`\`\`

### Quality Gates
- Minimum test coverage (e.g., 80%)
- No linting errors
- All tests passing
- Security vulnerabilities addressed
- Performance benchmarks met

## Team Guidelines
### Response Time Expectations
- **Critical fixes**: Within 4 hours
- **Regular features**: Within 24 hours
- **Non-urgent refactoring**: Within 48 hours

### Review Assignment
\`\`\`javascript
// CODEOWNERS file example
# Global reviewers
* @team-leads

# Frontend specific
/src/components/ @frontend-team
/src/styles/ @frontend-team

# Backend specific
/api/ @backend-team
/database/ @backend-team @dba-team

# DevOps and infrastructure
/docker/ @devops-team
/.github/workflows/ @devops-team
\`\`\`

## Common Anti-Patterns
### For Authors
1. **Too large PRs**: Keep changes focused and manageable
2. **Missing context**: Always provide clear PR descriptions
3. **Defensive responses**: Be open to feedback and suggestions
4. **Last-minute reviews**: Don't wait until deadline to submit

### For Reviewers
1. **Nitpicking**: Focus on important issues, not minor style preferences
2. **Design discussions in PRs**: Architecture should be discussed earlier
3. **Approval without reading**: Don't rubber-stamp reviews
4. **Personal preferences as requirements**: Distinguish between standards and opinions

## Measuring Review Effectiveness
### Metrics to Track
- Average time to first review
- Review coverage (percentage of PRs reviewed)
- Defect detection rate
- Time to merge after approval
- Number of review iterations per PR

### Review Quality Indicators
\`\`\`javascript
// Example metrics calculation
const calculateReviewMetrics = (reviews) => {
  const totalReviews = reviews.length;
  const averageTimeToReview = reviews.reduce((sum, review) => 
    sum + review.timeToFirstReview, 0) / totalReviews;
  
  const defectCatchRate = reviews.filter(review => 
    review.bugsFound > 0).length / totalReviews;
  
  return {
    averageTimeToReview: \`\${averageTimeToReview.toFixed(1)} hours\`,
    defectCatchRate: \`\${(defectCatchRate * 100).toFixed(1)}%\`,
    totalReviews
  };
};
\`\`\`

## Tools and Integration
### Popular Review Tools
- **GitHub Pull Requests**: Built-in review system
- **GitLab Merge Requests**: Comprehensive review features
- **Bitbucket Pull Requests**: Atlassian ecosystem integration
- **Azure DevOps**: Enterprise-focused review process

### IDE Integration
- Review comments directly in VS Code
- IntelliJ IDEA integration with VCS
- Real-time collaboration features
- Inline suggestions and discussions

## Continuous Improvement
### Regular Review Retrospectives
- What types of issues are commonly missed?
- Are reviews taking too long?
- Is the team learning from reviews?
- How can we improve the process?

### Training and Knowledge Sharing
- Pair programming sessions
- Code review workshops
- Sharing best practices
- Mentoring junior developers`,
      type: 'PROCESS',
      category: 'Development',
      tags: JSON.stringify(['Code Review', 'Best Practices', 'Quality', 'Team Collaboration', 'Development Process']),
      difficulty: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isPublic: true,
      authorId: developer1.id,
      projectId: project1.id,
      publishedAt: new Date(),
    },
  ];

  for (const item of knowledgeItems) {
    await prisma.knowledgeItem.create({
      data: item,
    });
  }

  console.log('✅ Created 13 knowledge items');

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