import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import api from '../api/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OwnerStackParamList } from '../navigation/OwnerStack';
import { removeTokens } from '../utils/authStorage';

type Props = NativeStackScreenProps<OwnerStackParamList, 'OwnerHome'>;

export default function OwnerHomeScreen({ navigation }: Props) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOwnerRestaurants();
  }, []);

  const fetchOwnerRestaurants = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/restaurants/');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants for owner:', error);
      Alert.alert('Error', 'Could not fetch your restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestaurant = () => {
    navigation.navigate('AddRestaurant');
  };

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate('MenuItems', { restaurantId });
  };

  const handleLogout = async () => {
    await removeTokens();
    navigation.replace('Login');
  };

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(item.id)}
    >
      <Text style={styles.restaurantName}>{item.name}</Text>
      <Text style={styles.restaurantInfo}>Location: {item.location}</Text>
      <Text style={styles.restaurantInfo}>Cuisine: {item.cuisine_type}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Your Restaurants</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRestaurant}>
          <Text style={styles.addButtonText}>Add Restaurant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : restaurants.length > 0 ? (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRestaurantItem}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      ) : (
        <Text style={styles.noRestaurants}>No restaurants found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // light gray background
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d9534f',
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
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
  restaurantInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  noRestaurants: {
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
});
