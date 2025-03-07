import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import api from '../api/api';

export default function AddRestaurantScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [viewMode, setViewMode] = useState<'view' | 'add'>('view'); // State for switching between view and add modes

  // Fetch the list of restaurants on load
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants/');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert('Error', 'Failed to fetch restaurants.');
    }
  };

  const addRestaurant = async () => {
    try {
      const response = await api.post('/restaurants/', {
        name,
        location,
        cuisine_type: cuisineType,
      });
      setRestaurants((prev) => [...prev, response.data]); // Add the new restaurant to the list
      setName('');
      setLocation('');
      setCuisineType('');
      setViewMode('view'); // Switch back to view mode after adding
      Alert.alert('Success', 'Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      Alert.alert('Error', 'Failed to add restaurant.');
    }
  };

  const renderRestaurant = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.restaurantItem}
      onPress={() => navigation.navigate('MenuItems', { restaurantId: item.id })}
    >
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text>Location: {item.location}</Text>
      <Text>Cuisine: {item.cuisine_type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <Button title="View Restaurants" onPress={() => setViewMode('view')} />
        <Button title="Add Restaurant" onPress={() => setViewMode('add')} />
      </View>

      {/* Conditional Rendering */}
      {viewMode === 'view' ? (
        <>
          <Text style={styles.title}>Your Restaurants</Text>
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRestaurant}
          />
        </>
      ) : (
        <View style={styles.addForm}>
          <Text style={styles.subtitle}>Add a New Restaurant</Text>
          <TextInput
            style={styles.input}
            placeholder="Restaurant Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Cuisine Type"
            value={cuisineType}
            onChangeText={setCuisineType}
          />
          <Button title="Add Restaurant" onPress={addRestaurant} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  restaurantItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  restaurantName: { fontSize: 16, fontWeight: 'bold' },
  addForm: {
    marginTop: 24,
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});
