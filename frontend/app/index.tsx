import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import Spinner from '@/src/components/UI/Spinner';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();


  if (isLoading) {
    return <Spinner />;
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/auth" />;
}
