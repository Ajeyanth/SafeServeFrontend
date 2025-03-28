import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import api from '../api/api';

export default function AddRestaurantScreen({ navigation }: any) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [viewMode, setViewMode] = useState<'view' | 'add'>('view');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/api/restaurants/');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert('Error', 'Failed to fetch restaurants.');
    }
  };

  const addRestaurant = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Restaurant name is required.');
      return;
    }
    try {
      const response = await api.post('/api/restaurants/', {
        name,
        location,
        cuisine_type: cuisineType,
      });
      setRestaurants((prev) => [...prev, response.data]);
      setName('');
      setLocation('');
      setCuisineType('');
      setViewMode('view');
      Alert.alert('Success', 'Restaurant added successfully!');
    } catch (error) {
      console.error('Error adding restaurant:', error);
      Alert.alert('Error', 'Failed to add restaurant.');
    }
  };

  const renderRestaurant = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('MenuItems', { restaurantId: item.id })}
    >
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.infoText}>Location: {item.location}</Text>
      <Text style={styles.infoText}>Cuisine: {item.cuisine_type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'view' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('view')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === 'view' && styles.toggleButtonTextActive,
            ]}
          >
            View Restaurants
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'add' && styles.toggleButtonActive,
          ]}
          onPress={() => setViewMode('add')}
        >
          <Text
            style={[
              styles.toggleButtonText,
              viewMode === 'add' && styles.toggleButtonTextActive,
            ]}
          >
            Add Restaurant
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'view' ? (
        <>
          <Text style={styles.screenTitle}>Your Restaurants</Text>
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRestaurant}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      ) : (
        <View style={styles.addFormCard}>
          <Text style={styles.formTitle}>Add a New Restaurant</Text>

          <TextInput
            style={styles.input}
            placeholder="Restaurant Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Cuisine Type"
            placeholderTextColor="#999"
            value={cuisineType}
            onChangeText={setCuisineType}
          />

          <TouchableOpacity style={styles.addButton} onPress={addRestaurant}>
            <Text style={styles.addButtonText}>Add Restaurant</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Light background
    padding: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007BFF',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#333',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  addFormCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
