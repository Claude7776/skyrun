import { AuthScreen } from '@/components/ui/AuthScreen';
import { RegisterForm } from '@/features/auth/RegisterForm';

export default function RegisterScreen() {
  return (
    <AuthScreen>
      <RegisterForm />
    </AuthScreen>
  );
}
