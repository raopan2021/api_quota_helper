import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddAccountScreen } from './src/screens/AddAccountScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// 主屏幕包装器 - 添加导航栏按钮
const HomeScreenWithNav = ({ navigation }) => {
  const { darkMode, refreshQuota } = useApp();
  
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <React.Fragment>
          <StatusBar style={darkMode ? 'light' : 'dark'} />
        </React.Fragment>
      ),
    });
  }, [navigation, darkMode]);
  
  return <HomeScreen />;
};

const MainApp: React.FC = () => {
  const { darkMode } = useApp();
  
  const navigationTheme = darkMode ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#0a84ff',
      background: '#000000',
      card: '#1c1c1e',
      text: '#ffffff',
      border: '#333333',
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#007AFF',
      background: '#f5f5f5',
      card: '#ffffff',
      text: '#000000',
      border: '#eeeeee',
    },
  };
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: darkMode ? '#1c1c1e' : '#ffffff',
          },
          headerTintColor: '#007AFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'API 额度查询',
            headerRight: () => (
              <React.Fragment>
                <StatusBar style={darkMode ? 'light' : 'dark'} />
              </React.Fragment>
            ),
          })}
        />
        <Stack.Screen
          name="AddAccount"
          component={AddAccountScreen}
          options={({ route }) => ({
            title: route.params?.editId ? '编辑账户' : '添加账户',
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '设置',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
