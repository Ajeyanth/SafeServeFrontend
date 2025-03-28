// navigation/CustomerStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import AllergySettingsScreen from '../screens/AllergySettingsScreen'; // import your allergy screen

const Stack = createNativeStackNavigator();

export default function CustomerStack() {
  return (
    <Stack.Navigator initialRouteName="CustomerHome">
      <Stack.Screen
        name="CustomerHome"
        component={CustomerHomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Restaurant Details' }}
      />
      {/* Add the AllergySettings route */}
      <Stack.Screen
        name="AllergySettings"
        component={AllergySettingsScreen}
        options={{ title: 'Manage Allergies' }}
      />
    </Stack.Navigator>
  );
}
