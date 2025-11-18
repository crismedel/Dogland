import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import Spinner from '@/src/components/UI/Spinner';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/auth" />;
}
