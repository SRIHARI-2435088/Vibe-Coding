# Knowledge Transfer Automation Tool - Coding Standards & Project Structure

## 🏗️ **Project Architecture Overview**

### **Technology Stack:**
- **Frontend**: React.js + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: Express.js + TypeScript + Prisma ORM
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Build Tools**: Vite (Frontend) + ts-node (Backend)
- **Package Manager**: npm (consistent across all modules)

### **Monorepo Structure:**
```
knowledge-transfer-tool/
├── README.md
├── .gitignore
├── .env.example
├── package.json (root workspace)
├── docker-compose.yml (optional)
├── docs/
│   ├── api/
│   ├── deployment/
│   └── user-guides/
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── index.html
│   ├── public/
│   ├── src/
│   └── ...
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   ├── src/
│   ├── uploads/ (file storage)
│   └── ...
└── shared/
    ├── package.json
    ├── types/
    ├── utils/
    └── constants/
```

---

## 🎨 **Frontend Project Structure**

### **Complete Frontend Directory Structure:**
```
frontend/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── index.html
├── .env.local
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── demo-assets/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── knowledge/
│   │   │   ├── KnowledgeList.tsx
│   │   │   ├── KnowledgeCard.tsx
│   │   │   ├── KnowledgeForm.tsx
│   │   │   ├── KnowledgeDetail.tsx
│   │   │   ├── KnowledgeSearch.tsx
│   │   │   └── KnowledgeFilters.tsx
│   │   ├── projects/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProjectDashboard.tsx
│   │   │   └── ProjectSelector.tsx
│   │   ├── files/
│   │   │   ├── FileUpload.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   └── DragDropZone.tsx
│   │   ├── video/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoAnnotation.tsx
│   │   │   ├── AnnotationEditor.tsx
│   │   │   └── VideoTimeline.tsx
│   │   ├── comments/
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentThread.tsx
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── EmptyState.tsx
│   │   └── icons/
│   │       ├── index.ts
│   │       └── custom-icons.tsx
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   └── DashboardMetrics.tsx
│   │   ├── knowledge/
│   │   │   ├── KnowledgePage.tsx
│   │   │   ├── CreateKnowledgePage.tsx
│   │   │   ├── EditKnowledgePage.tsx
│   │   │   └── KnowledgeDetailPage.tsx
│   │   ├── projects/
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   └── CreateProjectPage.tsx
│   │   ├── profile/
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── auth/
│   │   │   ├── useAuth.ts
│   │   │   └── useAuthState.ts
│   │   ├── api/
│   │   │   ├── useKnowledge.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useUsers.ts
│   │   │   ├── useFiles.ts
│   │   │   └── useComments.ts
│   │   ├── common/
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useToast.ts
│   │   └── index.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── ProjectContext.tsx
│   │   └── ToastContext.tsx
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── knowledge.ts
│   │   │   ├── projects.ts
│   │   │   ├── users.ts
│   │   │   ├── files.ts
│   │   │   └── comments.ts
│   │   ├── storage/
│   │   │   ├── localStorage.ts
│   │   │   └── sessionStorage.ts
│   │   └── utils/
│   │       ├── file-utils.ts
│   │       ├── validation.ts
│   │       └── date-utils.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── knowledge.ts
│   │   ├── projects.ts
│   │   ├── users.ts
│   │   ├── comments.ts
│   │   └── common.ts
│   ├── lib/
│   │   ├── utils.ts (shadcn utils)
│   │   ├── validations.ts (zod schemas)
│   │   ├── constants.ts
│   │   └── config.ts
│   └── styles/
│       ├── globals.css
│       ├── components.css
│       └── utilities.css
```

### **Frontend File Naming Conventions:**
- **Components**: PascalCase (`KnowledgeCard.tsx`)
- **Pages**: PascalCase with "Page" suffix (`DashboardPage.tsx`)
- **Hooks**: camelCase with "use" prefix (`useAuth.ts`)
- **Services**: camelCase (`authService.ts`)
- **Types**: camelCase (`userTypes.ts`)
- **Utils**: camelCase (`dateUtils.ts`)
- **Constants**: SCREAMING_SNAKE_CASE in constants file

---

## 🚀 **Backend Project Structure**

### **Complete Backend Directory Structure:**
```
backend/
├── package.json
├── tsconfig.json
├── .env
├── .env.example
├── nodemon.json
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   ├── seed.ts
│   └── dev.db (SQLite file)
├── uploads/ (local file storage)
│   ├── documents/
│   ├── videos/
│   ├── images/
│   └── temp/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── database.ts
│   │   ├── environment.ts
│   │   ├── cors.ts
│   │   └── multer.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── knowledge.controller.ts
│   │   ├── files.controller.ts
│   │   ├── comments.controller.ts
│   │   └── reviews.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── projects.service.ts
│   │   ├── knowledge.service.ts
│   │   ├── files.service.ts
│   │   ├── comments.service.ts
│   │   ├── search.service.ts
│   │   └── email.service.ts
│   ├── repositories/
│   │   ├── base.repository.ts
│   │   ├── users.repository.ts
│   │   ├── projects.repository.ts
│   │   ├── knowledge.repository.ts
│   │   ├── files.repository.ts
│   │   └── comments.repository.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── knowledge.routes.ts
│   │   ├── files.routes.ts
│   │   └── comments.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logging.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── file-upload.middleware.ts
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── users.validator.ts
│   │   ├── projects.validator.ts
│   │   ├── knowledge.validator.ts
│   │   └── files.validator.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── users.types.ts
│   │   ├── projects.types.ts
│   │   ├── knowledge.types.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── password.utils.ts
│   │   ├── file.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── date.utils.ts
│   │   └── logger.utils.ts
│   ├── constants/
│   │   ├── errors.constants.ts
│   │   ├── http-status.constants.ts
│   │   ├── file-types.constants.ts
│   │   └── app.constants.ts
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── fixtures/
└── dist/ (compiled JavaScript)
```

### **Backend File Naming Conventions:**
- **Controllers**: camelCase with ".controller.ts" suffix
- **Services**: camelCase with ".service.ts" suffix
- **Routes**: camelCase with ".routes.ts" suffix
- **Middleware**: camelCase with ".middleware.ts" suffix
- **Types**: camelCase with ".types.ts" suffix
- **Utils**: camelCase with ".utils.ts" suffix
- **Constants**: camelCase with ".constants.ts" suffix

---

## 📝 **Coding Standards & Conventions**

### **TypeScript Standards:**
```typescript
// Use strict TypeScript configuration
// tsconfig.json should include:
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Always define explicit types for function parameters and returns
function createKnowledgeItem(data: CreateKnowledgeRequest): Promise<KnowledgeItem> {
  // implementation
}

// Use interfaces for object shapes
interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Use union types for specific string/number values
type KnowledgeType = 'TECHNICAL' | 'BUSINESS' | 'PROCESS' | 'CULTURAL';
type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'CONTRIBUTOR' | 'VIEWER';
```

### **React Component Standards:**

#### **Component Type Preference:**
- **ALWAYS use functional components** - Modern React development standard
- **Class components ONLY for Error Boundaries** - Currently the only use case where class components are required
- **Use hooks for state and lifecycle management** - useState, useEffect, useMemo, useCallback, etc.

```typescript
// ✅ CORRECT: Functional component with TypeScript
interface KnowledgeCardProps {
  knowledge: KnowledgeItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  knowledge,
  onEdit,
  onDelete,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(knowledge.id);
    }
  }, [onEdit, knowledge.id]);

  useEffect(() => {
    // Component effects here
  }, []);

  return (
    <Card className={cn("p-4", className)}>
      <CardHeader>
        <CardTitle>{knowledge.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{knowledge.content}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleEdit} disabled={isLoading}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

// Export types alongside components
export type { KnowledgeCardProps };
```

#### **Functional Component Patterns:**
```typescript
// State management with hooks
const [state, setState] = useState<StateType>(initialState);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Effect hooks for lifecycle management
useEffect(() => {
  // Component did mount / dependency change
  return () => {
    // Cleanup function (component will unmount)
  };
}, [dependencies]);

// Memoization for performance
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const memoizedCallback = useCallback((param: string) => {
  // Callback logic
}, [dependencies]);

// Custom hooks for reusable logic
const useKnowledgeData = (projectId: string) => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledgeItems(projectId)
      .then(setKnowledge)
      .finally(() => setLoading(false));
  }, [projectId]);

  return { knowledge, loading };
};
```

#### **Component Composition Patterns:**
```typescript
// Higher-order component pattern (functional)
const withAuthentication = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { user, loading } = useAuth();
    
    if (loading) return <LoadingSpinner />;
    if (!user) return <LoginPrompt />;
    
    return <Component {...props} />;
  };
};

// Render props pattern
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean, error: string | null) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const { data, loading, error } = useAsync<T>(() => fetch(url).then(r => r.json()));
  return <>{children(data, loading, error)}</>;
};

// Compound component pattern
const Modal = ({ children, isOpen, onClose }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

const ModalHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="modal-header">{children}</div>
);

const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="modal-body">{children}</div>
);

// Compound usage
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
```

#### **❌ AVOID: Class Components (except Error Boundaries)**
```typescript
// ❌ DON'T DO THIS - Use functional components instead
class KnowledgeCard extends Component<KnowledgeCardProps, KnowledgeCardState> {
  constructor(props: KnowledgeCardProps) {
    super(props);
    this.state = { isLoading: false };
  }

  componentDidMount() {
    // Use useEffect instead
  }

  render() {
    // Convert to functional component
    return <div>...</div>;
  }
}
```

### **API Endpoint Standards:**
```typescript
// Controller pattern
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  async getKnowledgeItems(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, search, page = 1, limit = 10 } = req.query;
      
      const result = await this.knowledgeService.getKnowledgeItems({
        projectId: projectId as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit)
      });
      
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch knowledge items',
        error: error.message
      });
    }
  }
}
```

---

## 🎨 **Styling Standards**

### **Tailwind CSS Organization:**
```css
/* globals.css - Layer organization */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Global styles */
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  /* Reusable component styles */
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md;
  }
  
  .card-hover {
    @apply transition-all duration-200 hover:shadow-md hover:scale-[1.02];
  }
}

@layer utilities {
  /* Custom utility classes */
  .scrollbar-thin {
    scrollbar-width: thin;
  }
}
```

### **Component Styling Patterns:**
```typescript
// Use cn() utility for conditional classes
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        
        // Variant styles
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === 'default',
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
          "border border-input hover:bg-accent hover:text-accent-foreground": variant === 'outline',
        },
        
        // Size styles
        {
          "h-9 px-3 text-sm": size === 'sm',
          "h-10 px-4 py-2": size === 'default',
          "h-11 px-8": size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

---

## 🗃️ **Database Patterns & Prisma Standards**

### **Prisma Schema Conventions:**
```prisma
// Use consistent naming
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  firstName       String
  lastName        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relationships - always include both directions
  knowledgeItems  KnowledgeItem[]
  
  // Use @@map for table names
  @@map("users")
}

// Always define explicit field types
model KnowledgeItem {
  id          String          @id @default(cuid())
  title       String
  content     String          // Use String for long text
  type        KnowledgeType   // Use enums for constrained values
  tags        String[]        // Use arrays for lists
  authorId    String
  
  // Define relationships with proper constraints
  author      User            @relation(fields: [authorId], references: [id])
  
  @@map("knowledge_items")
}

// Use descriptive enum values
enum KnowledgeType {
  TECHNICAL
  BUSINESS
  PROCESS
  CULTURAL
  TROUBLESHOOTING
  BEST_PRACTICE
}
```

### **Database Service Patterns:**
```typescript
// Repository pattern for database operations
export class KnowledgeRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(options: FindKnowledgeOptions): Promise<KnowledgeWithRelations[]> {
    return this.prisma.knowledgeItem.findMany({
      where: {
        projectId: options.projectId,
        status: 'PUBLISHED',
        ...(options.search && {
          OR: [
            { title: { contains: options.search, mode: 'insensitive' } },
            { content: { contains: options.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        project: {
          select: { id: true, name: true }
        },
        _count: {
          select: { comments: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });
  }

  async create(data: CreateKnowledgeData): Promise<KnowledgeItem> {
    return this.prisma.knowledgeItem.create({
      data: {
        ...data,
        id: cuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
```

---

## 📁 **File & Folder Organization Rules**

### **Import/Export Standards:**
```typescript
// Use absolute imports with path mapping
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";
import { KnowledgeService } from "@/services/api/knowledge";

// Group imports logically
// 1. React/Next imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Third-party libraries
import { cn } from 'clsx';
import { format } from 'date-fns';

// 3. Internal imports (absolute paths)
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";

// 4. Relative imports
import './Component.css';

// Use barrel exports in index files
// components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card } from './card';

// Default exports for pages and main components
export default function DashboardPage() ac{
  return <div>Dashboard</div>;
}

// Named exports for utilities and services
export const authService = {
  login,
  logout,
  register,
};
```

### **Environment Configuration:**
```typescript
// backend/.env.example
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="100MB"

// frontend/.env.example
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_APP_NAME="Knowledge Transfer Tool"
VITE_MAX_FILE_SIZE="104857600"
```

---

## 🔧 **Development Workflow Standards**

### **Git Workflow:**
```bash
# Branch naming convention
feature/auth-implementation
bugfix/login-validation-error
hotfix/security-vulnerability
chore/update-dependencies

# Commit message format
feat: add user authentication system
fix: resolve file upload validation issue
docs: update API documentation
style: format code with prettier
refactor: reorganize component structure
test: add unit tests for auth service
chore: update dependencies

# Example commit messages
git commit -m "feat(auth): implement JWT-based authentication"
git commit -m "fix(upload): handle large file upload errors"
git commit -m "docs(api): add endpoint documentation for knowledge API"
```

### **Code Review Checklist:**
```markdown
## Code Review Checklist

### General
- [ ] Code follows TypeScript best practices
- [ ] Proper error handling implemented
- [ ] No console.log statements in production code
- [ ] Consistent naming conventions used

### Frontend Specific
- [ ] Components are properly typed
- [ ] Functional components used (class components only for Error Boundaries)
- [ ] React hooks used correctly (useState, useEffect, useMemo, useCallback)
- [ ] Tailwind classes are organized and optimized
- [ ] shadcn/ui components used consistently
- [ ] Proper accessibility attributes added
- [ ] Responsive design considerations

### Backend Specific
- [ ] API endpoints follow RESTful conventions
- [ ] Input validation implemented
- [ ] Proper HTTP status codes used
- [ ] Database queries are optimized
- [ ] Authentication/authorization checks in place

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Database queries are efficient
- [ ] File uploads handle large files properly
- [ ] Proper caching strategies implemented

### Security
- [ ] Input sanitization implemented
- [ ] SQL injection prevention
- [ ] XSS prevention measures
- [ ] Proper authentication checks
```

### **Testing Standards:**
```typescript
// Unit test example
describe('AuthService', () => {
  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      const result = await authService.login(email, password);
      
      expect(result).toMatchObject({
        user: expect.objectContaining({
          email,
          id: expect.any(String),
        }),
        token: expect.any(String),
      });
    });

    it('should throw error for invalid credentials', async () => {
      await expect(
        authService.login('invalid@email.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});

// Component test example
describe('KnowledgeCard', () => {
  const mockKnowledge: KnowledgeItem = {
    id: '1',
    title: 'Test Knowledge',
    content: 'Test content',
    authorId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should render knowledge item correctly', () => {
    render(<KnowledgeCard knowledge={mockKnowledge} />);
    
    expect(screen.getByText('Test Knowledge')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

---

## 📦 **Package.json Standards**

### **Frontend package.json:**
```json
{
  "name": "ktat-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.263.1",
    "clsx": "^1.2.1",
    "tailwind-merge": "^1.14.0",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0",
    "react-hook-form": "^7.45.0",
    "@hookform/resolvers": "^3.1.0",
    "zod": "^3.21.4",
    "react-error-boundary": "^4.0.11"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### **Backend package.json:**
```json
{
  "name": "ktat-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.1",
    "@prisma/client": "^5.1.0",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.4.2",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "nodemon": "^3.0.1",
    "prettier": "^3.0.0",
    "prisma": "^5.1.0",
    "tsx": "^3.12.7",
    "typescript": "^5.0.2"
  }
}
```

---

## 🚨 **Error Handling Standards**

### **Frontend Error Handling Patterns:**

#### **1. React Error Boundaries:**
```typescript
// ErrorBoundary.tsx - Note: Error boundaries currently require class components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

// ErrorFallback as functional component
interface ErrorFallbackProps {
  onReset: () => void;
  error?: Error;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onReset, error }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <h2 className="text-xl font-semibold text-destructive mb-4">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-4">
        We're sorry, but something unexpected happened.
      </p>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-4 text-sm text-muted-foreground">
          <summary>Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
        </details>
      )}
      <Button onClick={onReset} variant="outline">
        Try again
      </Button>
    </div>
  );
};

// Alternative: Use react-error-boundary library for functional approach
// npm install react-error-boundary
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

// Usage with functional component
const AppWithErrorBoundary: React.FC = () => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        // Log to error reporting service
      }}
      onReset={() => {
        // Clear any error state, reload data, etc.
        window.location.reload();
      }}
    >
      <App />
    </ReactErrorBoundary>
  );
};
```

#### **2. API Error Handling Hook:**
```typescript
// hooks/useErrorHandler.ts
interface ApiError {
  message: string;
  status?: number;
  code?: string;
  field?: string;
}

interface UseErrorHandlerReturn {
  handleError: (error: unknown) => void;
  clearError: () => void;
  error: ApiError | null;
  isError: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((error: unknown) => {
    let apiError: ApiError = {
      message: 'An unexpected error occurred'
    };

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      // Handle different HTTP status codes
      switch (status) {
        case 400:
          apiError = {
            message: data?.message || 'Invalid request data',
            status,
            field: data?.field,
          };
          break;
        case 401:
          apiError = {
            message: 'You are not authorized. Please login again.',
            status,
          };
          // Redirect to login or refresh token
          break;
        case 403:
          apiError = {
            message: 'You do not have permission to perform this action.',
            status,
          };
          break;
        case 404:
          apiError = {
            message: data?.message || 'Resource not found',
            status,
          };
          break;
        case 422:
          apiError = {
            message: data?.message || 'Validation failed',
            status,
            field: data?.field,
          };
          break;
        case 429:
          apiError = {
            message: 'Too many requests. Please try again later.',
            status,
          };
          break;
        case 500:
          apiError = {
            message: 'Server error. Please try again later.',
            status,
          };
          break;
        default:
          apiError = {
            message: data?.message || 'An unexpected error occurred',
            status,
          };
      }
    } else if (error instanceof Error) {
      apiError.message = error.message;
    }

    setError(apiError);
    
    // Show toast notification
    toast({
      title: "Error",
      description: apiError.message,
      variant: "destructive",
    });

  }, [toast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    handleError,
    clearError,
    error,
    isError: error !== null,
  };
};
```

#### **3. Form Validation Error Handling:**
```typescript
// Form error handling with react-hook-form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const knowledgeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.enum(['TECHNICAL', 'BUSINESS', 'PROCESS', 'CULTURAL']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type KnowledgeFormData = z.infer<typeof knowledgeSchema>;

export const KnowledgeForm: React.FC = () => {
  const { handleError } = useErrorHandler();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeSchema),
  });

  const onSubmit = async (data: KnowledgeFormData) => {
    try {
      await knowledgeService.create(data);
      toast({ title: "Success", description: "Knowledge item created!" });
    } catch (error) {
      // Handle field-specific errors from backend
      if (axios.isAxiosError(error) && error.response?.data?.field) {
        setError(error.response.data.field, {
          message: error.response.data.message,
        });
      } else {
        handleError(error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          {...register('title')}
          placeholder="Knowledge title"
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">
            {errors.title.message}
          </p>
        )}
      </div>
      {/* Other form fields */}
    </form>
  );
};
```

#### **4. Async Operation Error Handling:**
```typescript
// Custom hook for async operations with error handling
interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useAsync = <T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    const executeAsync = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction();
        
        if (!isCancelled) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      }
    };

    executeAsync();

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  return state;
};
```

### **Backend Error Handling Patterns:**

#### **1. Custom Error Classes:**
```typescript
// utils/errors.ts
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public field?: string;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string,
    field?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 422, true, 'VALIDATION_ERROR', field);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT');
  }
}
```

#### **2. Global Error Handling Middleware:**
```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let field: string | undefined;

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
    field = error.field;
  }
  // Handle Prisma errors
  else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        code = 'DUPLICATE_ENTRY';
        field = error.meta?.target as string;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid foreign key constraint';
        code = 'FOREIGN_KEY_CONSTRAINT';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
        code = 'DATABASE_ERROR';
    }
  }
  // Handle validation errors from express-validator
  else if (error.name === 'ValidationError') {
    statusCode = 422;
    message = error.message;
    code = 'VALIDATION_ERROR';
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }
  // Handle multer errors (file upload)
  else if (error.name === 'MulterError') {
    statusCode = 400;
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        code = 'TOO_MANY_FILES';
        break;
      default:
        message = 'File upload error';
        code = 'UPLOAD_ERROR';
    }
  }

  // Log error details
  logger.error({
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    field,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(field && { field }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
};
```

#### **3. Async Handler Wrapper:**
```typescript
// utils/asyncHandler.ts
import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage in controllers
export const getKnowledgeItems = asyncHandler(
  async (req: Request, res: Response) => {
    const { projectId, search, page = 1, limit = 10 } = req.query;

    if (!projectId) {
      throw new ValidationError('Project ID is required', 'projectId');
    }

    const result = await knowledgeService.getKnowledgeItems({
      projectId: projectId as string,
      search: search as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: Math.ceil(result.total / result.limit),
      },
    });
  }
);
```

#### **4. Service Layer Error Handling:**
```typescript
// services/knowledge.service.ts
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

export class KnowledgeService {
  async createKnowledgeItem(data: CreateKnowledgeData): Promise<KnowledgeItem> {
    try {
      // Validate project exists
      const project = await this.projectRepository.findById(data.projectId);
      if (!project) {
        throw new NotFoundError('Project');
      }

      // Check for duplicate title in project
      const existing = await this.knowledgeRepository.findByTitle(
        data.title,
        data.projectId
      );
      if (existing) {
        throw new ConflictError('Knowledge item with this title already exists in the project');
      }

      // Validate content length
      if (data.content.length < 10) {
        throw new ValidationError('Content must be at least 10 characters long', 'content');
      }

      return await this.knowledgeRepository.create(data);
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }

      // Handle unexpected database errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw error; // Will be handled by error middleware
      }

      // Handle any other unexpected errors
      throw new AppError('Failed to create knowledge item', 500, false);
    }
  }

  async updateKnowledgeItem(
    id: string,
    data: UpdateKnowledgeData
  ): Promise<KnowledgeItem> {
    try {
      const existingItem = await this.knowledgeRepository.findById(id);
      if (!existingItem) {
        throw new NotFoundError('Knowledge item');
      }

      return await this.knowledgeRepository.update(id, data);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update knowledge item', 500, false);
    }
  }
}
```

#### **5. Database Transaction Error Handling:**
```typescript
// Repository transaction pattern
export class KnowledgeRepository {
  async createWithAttachments(
    knowledgeData: CreateKnowledgeData,
    attachments: CreateAttachmentData[]
  ): Promise<KnowledgeItem> {
    return await this.prisma.$transaction(async (tx) => {
      try {
        // Create knowledge item
        const knowledgeItem = await tx.knowledgeItem.create({
          data: knowledgeData,
        });

        // Create attachments
        if (attachments.length > 0) {
          await tx.attachment.createMany({
            data: attachments.map(attachment => ({
              ...attachment,
              knowledgeItemId: knowledgeItem.id,
            })),
          });
        }

        return knowledgeItem;
      } catch (error) {
        // Transaction will automatically rollback
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw error;
        }
        throw new AppError('Failed to create knowledge item with attachments', 500);
      }
    });
  }
}
```

#### **6. File Upload Error Handling:**
```typescript
// middleware/file-upload.middleware.ts
import multer, { MulterError } from 'multer';
import path from 'path';
import { ValidationError } from '../utils/errors';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Define allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`File type ${file.mimetype} is not allowed`, 'file'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 5, // Maximum 5 files
  },
});

// Error handling for file upload
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof MulterError) {
    next(error); // Will be handled by global error handler
  } else if (error instanceof ValidationError) {
    next(error);
  } else {
    next(new AppError('File upload failed', 400));
  }
};
```

### **Error Response Standardization:**

#### **Standard Error Response Format:**
```typescript
// All API errors should follow this format
interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  field?: string; // For validation errors
  details?: any; // Additional error details
  stack?: string; // Only in development
  timestamp: string;
  path: string;
}

// Success response format
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}
```

#### **Centralized Response Helper:**
```typescript
// utils/response.ts
export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    pagination?: any
  ) {
    res.json({
      success: true,
      data,
      ...(message && { message }),
      ...(pagination && { pagination }),
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    code: string,
    field?: string,
    details?: any
  ) {
    res.status(statusCode).json({
      success: false,
      message,
      code,
      ...(field && { field }),
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path: res.req.originalUrl,
    });
  }
}
```

---

## 🚀 **Performance & Optimization Standards**

### **Frontend Optimization:**
```typescript
// Lazy loading for pages
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const KnowledgePage = lazy(() => import('@/pages/knowledge/KnowledgePage'));

// Memoization for expensive calculations
const MemoizedKnowledgeList = React.memo(KnowledgeList);

// Debounced search
const useSearch = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return [debouncedValue, setValue] as const;
};
```

### **Backend Optimization:**
```typescript
// Database query optimization
const getKnowledgeWithRelations = async (id: string) => {
  return prisma.knowledgeItem.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true } // Only select needed fields
      },
      attachments: true,
      _count: {
        select: { comments: true, reviews: true }
      }
    }
  });
};

// Response caching middleware
const cache = new Map();
const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration) {
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, { data, timestamp: Date.now() });
      return originalJson.call(this, data);
    };
    
    next();
  };
};
```

---

## ✅ **Quality Assurance Standards**

### **Code Quality Tools Configuration:**

#### **ESLint Configuration (.eslintrc.js):**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

#### **Prettier Configuration (.prettierrc):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### **Pre-commit Hooks (package.json):**
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

**This structure ensures maintainable, scalable, and consistent code across the entire Knowledge Transfer Automation Tool project. All team members should follow these standards for optimal collaboration and code quality.** 