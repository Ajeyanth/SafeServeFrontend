import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../api/api';

export default function HomeScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants/');
      setRestaurants(response.data); // Populate state with restaurant data
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert('Error', 'Failed to fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  const renderRestaurant = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.restaurantItem}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text>Location: {item.location}</Text>
      <Text>Cuisine: {item.cuisine_type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurants</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurant}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  restaurantItem: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  restaurantName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
});
