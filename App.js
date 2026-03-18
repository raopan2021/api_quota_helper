import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AddAccountScreen } from './src/screens/AddAccountScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppContent: React.FC = () => {
  const { darkMode } = useApp();
  
  return (
    <NavigationContainer>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: darkMode ? '#1c1c1e' : '#fff',
          },
          headerTintColor: '#007AFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: darkMode ? '#000' : '#fff',
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
                <React.Fragment>
                  <StatusBar style={darkMode ? 'light' : 'dark'} />
                </React.Fragment>
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

// 主屏幕包装器 - 添加导航栏按钮
import { TouchableOpacity, Text, View } from 'react-native';

const HomeScreenWithNav = ({ navigation }) => {
  const { darkMode, refreshQuota, isLoading } = useApp();
  
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={refreshQuota}>
            <Text style={{ fontSize: 20 }}>🔄</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, darkMode, isLoading]);
  
  return <HomeScreen />;
};

const MainApp: React.FC = () => {
  const { darkMode } = useApp();
  
  return (
    <NavigationContainer
      theme={{
        dark: darkMode,
        colors: {
          primary: '#007AFF',
          background: darkMode ? '#000' : '#fff',
          card: darkMode ? '#1c1c1e' : '#fff',
          text: darkMode ? '#fff' : '#000',
          border: darkMode ? '#333' : '#eee',
          notification: '#ff3b30',
        },
      }}
    >
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreenWithNav}
          options={({ navigation }) => ({
            title: 'API 额度查询',
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={{ marginRight: 16 }}
                >
                  <Text style={{ fontSize: 20 }}>⚙️</Text>
                </TouchableOpacity>
              </View>
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

// 需要重新导入
import { useNavigation } from '@react-navigation/native';

const HomeScreenWithNavWrapper: React.FC = () => {
  const { darkMode, refreshQuota, isLoading } = useApp();
  const navigation = useNavigation();
  
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{ marginRight: 16 }}
          >
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, darkMode]);
  
  return <HomeScreen />;
};

const FinalApp: React.FC = () => {
  const { darkMode } = useApp();
  
  return (
    <NavigationContainer
      theme={{
        dark: darkMode,
        colors: {
          primary: '#007AFF',
          background: darkMode ? '#000' : '#fff',
          card: darkMode ? '#1c1c1e' : '#fff',
          text: darkMode ? '#fff' : '#000',
          border: darkMode ? '#333' : '#eee',
          notification: '#ff3b30',
        },
      }}
    >
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreenWithNavWrapper}
          options={({ navigation }) => ({
            title: 'API 额度查询',
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={{ marginRight: 16 }}
                >
                  <Text style={{ fontSize: 20 }}>⚙️</Text>
                </TouchableOpacity>
              </View>
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
        <FinalApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
