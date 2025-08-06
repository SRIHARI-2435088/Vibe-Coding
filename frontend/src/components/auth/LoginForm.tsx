import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/useToast';
import { handleApiError, handleValidationError } from '@/lib/error-handler';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { BookOpen, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Validation Error', 'Please fill in all fields');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success('Login Successful', 'Welcome back!');
    } catch (error: any) {
      console.error('Login error:', error);
      handleApiError(error, 'Login Failed');
    }
  };

  const handleDemoLogin = async (email: string) => {
    try {
      // Use the correct demo passwords based on email
      const passwords: { [key: string]: string } = {
        'admin@ktat.com': 'admin123!',
        'pm@ktat.com': 'pm123!',
        'dev@ktat.com': 'dev123!'
      };
      const password = passwords[email] || 'demo123!';
      await login(email, password);
      toast.success('Demo Login Successful', `Logged in as ${email}`);
    } catch (error: any) {
      console.error('Demo login error:', error);
      handleApiError(error, 'Demo Login Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Knowledge Transfer Tool account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Demo accounts section */}
            <div className="space-y-2">
              <div className="text-center text-sm text-muted-foreground">
                Or try a demo account:
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin@ktat.com')}
                  disabled={isLoading}
                >
                  Admin Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('pm@ktat.com')}
                  disabled={isLoading}
                >
                  Project Manager Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('dev@ktat.com')}
                  disabled={isLoading}
                >
                  Developer Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </form>

        <CardFooter className="text-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm; 