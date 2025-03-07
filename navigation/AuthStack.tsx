import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CustomerStack from './CustomerStack';
import OwnerStack from './OwnerStack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  CustomerStack: undefined;
  OwnerStack: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CustomerStack" component={CustomerStack} options={{ headerShown: false }} />
      <Stack.Screen name="OwnerStack" component={OwnerStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
