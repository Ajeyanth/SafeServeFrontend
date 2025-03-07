import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import api from '../api/api';

export default function RestaurantDetailScreen({ route }: any) {
  const { restaurantId } = route.params; // Get the restaurant ID from navigation params
  const [restaurant, setRestaurant] = useState<any>(null); // Restaurant details
  const [menuItems, setMenuItems] = useState([]); // Menu items
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenuItems();
  }, []);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      Alert.alert('Error', 'Failed to fetch restaurant details.');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/menu/`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      Alert.alert('Error', 'Failed to fetch menu items.');
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItem = ({ item }: { item: any }) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text>Ingredients: {item.ingredients}</Text>
      <Text>Allergens: {item.allergens}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          {restaurant && (
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <Text>Location: {restaurant.location}</Text>
              <Text>Cuisine: {restaurant.cuisine_type}</Text>
            </View>
          )}

          <Text style={styles.subtitle}>Menu Items</Text>
          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMenuItem}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  detailsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  menuItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  menuItemName: { fontSize: 16, fontWeight: 'bold' },
});
