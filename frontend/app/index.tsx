import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/auth" />;
}
