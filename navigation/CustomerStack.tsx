import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';

export type CustomerStackParamList = {
  Home: undefined;
  RestaurantDetail: { restaurantId: number }; // Pass restaurant ID to the detail screen
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export default function CustomerStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Restaurant Details' }}
      />
    </Stack.Navigator>
  );
}
