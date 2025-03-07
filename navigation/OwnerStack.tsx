import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddRestaurantScreen from '../screens/AddRestaurantScreen';
import MenuItemsScreen from '../screens/MenuItemsScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';

export type OwnerStackParamList = {
  AddRestaurant: undefined;
  MenuItems: { restaurantId: number };
  CategoryManagement: { restaurantId: number };
};

const Stack = createNativeStackNavigator<OwnerStackParamList>();

export default function OwnerStack() {
  return (
    <Stack.Navigator initialRouteName="AddRestaurant">
      <Stack.Screen
        name="AddRestaurant"
        component={AddRestaurantScreen}
        options={{ title: 'Add Restaurant' }}
      />
      <Stack.Screen
        name="MenuItems"
        component={MenuItemsScreen}
        options={{ title: 'Manage Menu Items' }}
      />
      <Stack.Screen
        name="CategoryManagement"
        component={CategoryManagementScreen}
        options={{ title: 'Manage Categories' }}
      />
    </Stack.Navigator>
  );
}
