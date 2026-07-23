import { AuthScreen } from '@/components/ui/AuthScreen';
import { LoginForm } from '@/features/auth/LoginForm';

export default function LoginScreen() {
  return (
    <AuthScreen>
      <LoginForm />
    </AuthScreen>
  );
}
