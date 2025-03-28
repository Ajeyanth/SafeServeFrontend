import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../api/api';

type MenuItem = {
  id: number;
  name: string;
  ingredients: string;
  allergens: string;
};

export default function RestaurantDetailScreen({ route }: any) {
  const { restaurantId } = route.params;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userAllergens, setUserAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAllergens();
    fetchRestaurantDetails();
    fetchMenuItems();
  }, []);

  // Fetch user’s allergens from /api/users/me/
  const fetchUserAllergens = async () => {
    try {
      const response = await api.get('/api/users/me/');
      // Suppose response.data.dietary_restrictions is a comma-separated string like "Dairy,Peanuts"
      const allergensString = response.data.dietary_restrictions || '';
      const parsed = allergensString
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a.length > 0);

      setUserAllergens(parsed);
    } catch (error) {
      console.error('Error fetching user allergens:', error);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      const response = await api.get(`/api/restaurants/${restaurantId}/`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      Alert.alert('Error', 'Failed to fetch restaurant details.');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get(`/api/restaurants/${restaurantId}/menu/`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      Alert.alert('Error', 'Failed to fetch menu items.');
    } finally {
      setLoading(false);
    }
  };

  // Check if there's an overlap between this menu item's allergens and the user's allergens
  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const itemAllergens = (item.allergens || '')
      .split(',')
      .map((a: string) => a.trim())
      .filter((a: string) => a.length > 0);

    const overlap = itemAllergens.filter((allergen) =>
      userAllergens.map((a) => a.toLowerCase()).includes(allergen.toLowerCase())
    );

    const containsUserAllergens = overlap.length > 0;

    return (
      <View
        style={[
          styles.menuItem,
          containsUserAllergens && styles.allergenHighlight,
        ]}
      >
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemText}>Ingredients: {item.ingredients}</Text>
        <Text style={styles.menuItemText}>Allergens: {item.allergens || 'N/A'}</Text>
        {containsUserAllergens && (
          <Text style={styles.allergenWarning}>
            Contains YOUR allergens: {overlap.join(', ')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={styles.loadingIndicator}
        />
      ) : (
        <>
          {/* Restaurant Details */}
          {restaurant && (
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <Text style={styles.detailsText}>
                Location: {restaurant.location || 'N/A'}
              </Text>
              <Text style={styles.detailsText}>
                Cuisine: {restaurant.cuisine_type || 'N/A'}
              </Text>
            </View>
          )}

          <Text style={styles.subtitle}>Menu Items</Text>

          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMenuItem}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

// STYLE SHEET
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  detailsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,

    // Android elevation
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  menuItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,

    // Android elevation
    elevation: 2,
  },
  allergenHighlight: {
    backgroundColor: '#ffe6e6',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  allergenWarning: {
    marginTop: 6,
    color: 'red',
    fontWeight: 'bold',
  },
});
