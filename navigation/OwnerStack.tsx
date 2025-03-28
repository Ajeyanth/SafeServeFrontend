import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import AddRestaurantScreen from '../screens/AddRestaurantScreen';
import MenuItemsScreen from '../screens/MenuItemsScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
// Import your barcode scanner screen:
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';

export type OwnerStackParamList = {
  OwnerHome: undefined;
  AddRestaurant: undefined;
  MenuItems: { restaurantId: number };
  CategoryManagement: { restaurantId: number };
  // Add the scanner route, optionally with a param for a callback:
  BarcodeScanner: { onScanComplete: (barcode: string) => void };
};

const Stack = createNativeStackNavigator<OwnerStackParamList>();

export default function OwnerStack() {
  return (
    <Stack.Navigator initialRouteName="OwnerHome">
      <Stack.Screen
        name="OwnerHome"
        component={OwnerHomeScreen}
        options={{ title: 'Your Restaurants' }}
      />
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
      {/* New barcode scanner route */}
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ title: 'Scan Barcode' }}
      />
    </Stack.Navigator>
  );
}
