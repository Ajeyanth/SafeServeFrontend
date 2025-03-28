import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from 'react-native';
import api from '../api/api';
import { removeTokens } from '../utils/authStorage';

export default function RestaurantHomeScreen({ navigation }: any) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerRestaurant();
  }, []);

  const fetchOwnerRestaurant = async () => {
    try {
      // GET /api/restaurants/ => get the list of restaurants owned by this user
      const response = await api.get('/api/restaurants/');
      // If your logic ensures the owner has exactly one restaurant, grab [0].
      setRestaurant(response.data.length > 0 ? response.data[0] : null);
    } catch (error) {
      console.error('Error fetching owner’s restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeTokens();
    navigation.replace('Login');
  };

  const handleManageMenu = () => {
    if (restaurant) {
      navigation.navigate('MenuManagement', { restaurantId: restaurant.id });
    }
  };

  const handleGenerateQR = () => {
    if (restaurant) {
      navigation.navigate('GenerateQR', { restaurantId: restaurant.id });
    }
  };

  const handleManageCategories = () => {
    if (restaurant) {
      navigation.navigate('CategoryScreen', { restaurantId: restaurant.id });
    }
  };

  const handleEditRestaurantInfo = () => {
    if (restaurant) {
      navigation.navigate('EditRestaurant', { restaurantId: restaurant.id });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : restaurant ? (
        <>
          <Text style={styles.title}>Owner Dashboard</Text>
          <Text style={styles.info}>Restaurant Name: {restaurant.name}</Text>
          <Text style={styles.info}>Location: {restaurant.location}</Text>
          <Text style={styles.info}>
            Cuisine Type: {restaurant.cuisine_type}
          </Text>

          <Button title="Manage Menu" onPress={handleManageMenu} />
          <Button title="Manage Categories" onPress={handleManageCategories} />
          <Button
            title="Generate QR Code"
            onPress={handleGenerateQR}
            color="#5cb85c"
          />
          <Button
            title="Edit Restaurant Info"
            onPress={handleEditRestaurantInfo}
            color="#0275d8"
          />

          <Button title="Logout" onPress={handleLogout} color="#d9534f" />
        </>
      ) : (
        <Text>No restaurant found for this owner.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  info: { fontSize: 16, marginBottom: 8 },
});
