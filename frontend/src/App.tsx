import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { KnowledgeBase } from '@/components/knowledge/KnowledgeBase';
import { VideoLibrary } from '@/components/video/VideoLibrary';
import { Analytics } from '@/components/analytics/Analytics';
import { ProjectsList } from '@/components/projects/ProjectsList';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { UserManagement } from '@/components/admin/UserManagement';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { AdminProjectsManagement } from '@/components/admin/AdminProjectsManagement';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useGlobalPermissions } from '@/hooks/useRolePermissions';
import { 
  Button, 
  Avatar,
  AvatarFallback,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
} from '@/components/ui';
import { 
  Search, 
  Bell,
  BookOpen,
  FileText,
  Video,
  BarChart3,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Loader2,
  Crown,
  Users,
  FolderEdit
} from 'lucide-react';

// Authentication wrapper component
const AuthenticationGate: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (authMode === 'login') {
    return (
      <LoginForm 
        onSwitchToRegister={() => setAuthMode('register')} 
      />
    );
  }

  return (
    <RegisterForm 
      onSwitchToLogin={() => setAuthMode('login')} 
    />
  );
};

// Main application layout component
const AppLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { isSystemAdmin, canManageUsers, canManageContent, canAccessAdminPanel } = useGlobalPermissions();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setViewMode('list');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Knowledge Transfer Tool
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                        {user?.role}
                      </Badge>
                        {isSystemAdmin() && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            <Crown className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className={`grid w-full ${
            !canAccessAdminPanel() 
              ? 'grid-cols-5' 
              : canManageUsers() && canManageContent()
                ? 'grid-cols-8'
                : canManageUsers() || canManageContent()
                  ? 'grid-cols-7' 
                  : 'grid-cols-6'
          }`}>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Knowledge</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            {canAccessAdminPanel() && (
              <>
                {canManageUsers() && (
                  <TabsTrigger value="users" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="projects-mgmt" className="flex items-center space-x-2">
                  <FolderEdit className="h-4 w-4" />
                  <span>Manage Projects</span>
                </TabsTrigger>
                {canManageContent() && (
                  <TabsTrigger value="content-mgmt" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Manage Content</span>
                  </TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            {viewMode === 'list' ? (
              <ProjectsList 
                onProjectClick={handleProjectClick}
                showCreateButton={true}
              />
            ) : (
              selectedProject && (
                <ProjectDetail
                  projectId={selectedProject.id}
                  onBack={handleBackToProjects}
                />
              )
            )}
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge">
            <KnowledgeBase />
          </TabsContent>

          {/* Video Library Tab */}
          <TabsContent value="videos">
            <VideoLibrary />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          {/* Admin Tabs */}
          {canAccessAdminPanel() && (
            <>
              {/* User Management Tab */}
              {canManageUsers() && (
                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>
              )}

              {/* Projects Management Tab */}
              <TabsContent value="projects-mgmt">
                <AdminProjectsManagement />
              </TabsContent>

              {/* Content Management Tab */}
              {canManageContent() && (
                <TabsContent value="content-mgmt">
                  <ContentManagement />
                </TabsContent>
              )}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

// Main App component
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AppLayout /> : <AuthenticationGate />;
};

// App with providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer />
    </AuthProvider>
  );
}

export default App; 