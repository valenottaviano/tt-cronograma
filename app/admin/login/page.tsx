import { AdminLoginForm } from '@/components/auth/admin-login-form';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <AdminLoginForm />
    </div>
  );
}
