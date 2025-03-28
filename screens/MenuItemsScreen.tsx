import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api/api';

// Known allergens for checkboxes
const KNOWN_ALLERGENS = [
  'Dairy',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soy',
  'Gluten',
];

export default function MenuItemsScreen({ route, navigation }: any) {
  const { restaurantId } = route.params;

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Fields for the menu item form
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [qrCodeURL, setQRCodeURL] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState<string>('');

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/api/restaurants/${restaurantId}/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories.');
    }
  };

  // Toggle a known allergen in the form
  const handleToggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) => {
      if (prev.includes(allergen)) {
        return prev.filter((a) => a !== allergen);
      } else {
        return [...prev, allergen];
      }
    });
  };

  // Navigate to BarcodeScanner, handle returned barcode
  const handleScanBarcode = () => {
    navigation.navigate('BarcodeScanner', {
      onScanComplete: (barcode: string) => {
        fetchOpenFoodFacts(barcode);
      },
    });
  };

  // If user typed a barcode manually
  const handleManualFetch = () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number.');
      return;
    }
    fetchOpenFoodFacts(manualBarcode.trim());
  };

  // Fetch from Open Food Facts
  const fetchOpenFoodFacts = async (barcode: string) => {
    try {
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const offData = await offResponse.json();

      if (offData.status === 1) {
        // Product found
        const product = offData.product;
        if (product.ingredients_text) {
          setIngredients(product.ingredients_text);
        }

        // Attempt to auto-select known allergens
        const tags = product.allergens_tags || [];
        const matchedAllergens: string[] = [];
        tags.forEach((tag: string) => {
          const allergenName = tag.replace(/^.{2}:/, '').trim().toLowerCase();
          KNOWN_ALLERGENS.forEach((known) => {
            if (known.toLowerCase() === allergenName) {
              matchedAllergens.push(known);
            }
          });
        });

        // Merge with already selected
        setSelectedAllergens((prev) => Array.from(new Set([...prev, ...matchedAllergens])));

        Alert.alert('Open Food Facts', 'Product data imported successfully!');
      } else {
        Alert.alert('Not Found', 'No product data on Open Food Facts for this barcode.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to contact Open Food Facts. Try again later.');
    }
  };

  // Add or edit a menu item
  const addOrEditMenuItem = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    const allergensString = selectedAllergens.join(',');
    const data = {
      name,
      ingredients,
      allergens: allergensString,
      category_id: selectedCategoryId,
    };

    try {
      if (isEditing && editingItem) {
        // Update existing item
        await api.put(`/api/restaurants/${restaurantId}/menu/${editingItem.id}/`, data);
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
        );
        Alert.alert('Success', 'Menu item updated successfully!');
      } else {
        // Create new item
        const response = await api.post(`/api/restaurants/${restaurantId}/menu/`, data);
        setMenuItems((prev) => [...prev, response.data]);
        Alert.alert('Success', 'Menu item added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      Alert.alert('Error', 'Failed to save menu item.');
    }
  };

  // Delete a menu item
  const deleteMenuItem = async (id: number) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/restaurants/${restaurantId}/menu/${id}/`);
            setMenuItems((prev) => prev.filter((item) => item.id !== id));
            Alert.alert('Success', 'Menu item deleted successfully!');
          } catch (error) {
            console.error('Error deleting menu item:', error);
            Alert.alert('Error', 'Failed to delete menu item.');
          }
        },
      },
    ]);
  };

  // Edit a menu item (prefill form)
  const editMenuItem = (item: any) => {
    setIsEditing(true);
    setEditingItem(item);
    setName(item.name);
    setIngredients(item.ingredients);
    setSelectedCategoryId(item.category ? item.category.id : null);

    // parse allergens
    const existingAllergens = (item.allergens || '').split(',').map((a: string) => a.trim());
    const matchedKnown = existingAllergens.filter((a) => KNOWN_ALLERGENS.includes(a));
    setSelectedAllergens(matchedKnown);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    setName('');
    setIngredients('');
    setSelectedAllergens([]);
    setSelectedCategoryId(null);
    setManualBarcode('');
  };

  // Generate a QR code for this restaurant's menu
  const generateQRCode = async () => {
    try {
      const response = await api.get(`/api/restaurants/${restaurantId}/generate-qr/`, {
        responseType: 'blob',
      });
      const qrCodeBlob = new Blob([response.data], { type: 'image/png' });
      const qrCodeURL = URL.createObjectURL(qrCodeBlob);
      setQRCodeURL(qrCodeURL);
      Alert.alert('Success', 'QR Code generated successfully!');
    } catch (error: any) {
      console.error('Error generating QR code:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to generate QR Code.');
    }
  };

  // Render each menu item card
  const renderMenuItem = ({ item }: { item: any }) => (
    <View style={styles.menuItemCard}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text style={styles.itemInfo}>Ingredients: {item.ingredients}</Text>
      <Text style={styles.itemInfo}>Allergens: {item.allergens || 'None'}</Text>
      <Text style={styles.itemInfo}>
        Category: {item.category ? item.category.name : 'No Category'}
      </Text>

      <View style={styles.menuItemActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => editMenuItem(item)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMenuItem(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={menuItems}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMenuItem}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>Manage Menu Items</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('CategoryManagement', { restaurantId })}
          >
            <Text style={styles.linkText}>Manage Categories</Text>
          </TouchableOpacity>
        </View>
      }
      ListFooterComponent={
        <>
          {/* QR Code Generation */}
          <View style={styles.qrContainer}>
            <TouchableOpacity style={styles.qrButton} onPress={generateQRCode}>
              <Text style={styles.qrButtonText}>Generate QR Code for Menu</Text>
            </TouchableOpacity>

            {qrCodeURL && (
              <Image source={{ uri: qrCodeURL }} style={styles.qrCode} />
            )}
          </View>

          {/* Menu Item Form */}
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Ingredients (comma separated)"
              value={ingredients}
              onChangeText={setIngredients}
            />

            <Text style={styles.subtitle}>Allergens</Text>
            <View style={styles.allergenList}>
              {KNOWN_ALLERGENS.map((allergen) => {
                const isSelected = selectedAllergens.includes(allergen);
                return (
                  <TouchableOpacity
                    key={allergen}
                    style={styles.checkboxContainer}
                    onPress={() => handleToggleAllergen(allergen)}
                  >
                    <Text style={styles.checkboxLabel}>
                      {isSelected ? '☑' : '☐'} {allergen}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Select Category" value={null} />
              {categories.map((cat: any) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>

            <Text style={[styles.subtitle, { marginTop: 20 }]}>
              Barcode Scanning / Manual Entry
            </Text>

            <TouchableOpacity style={styles.scanButton} onPress={handleScanBarcode}>
              <Text style={styles.scanButtonText}>Scan Barcode</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type Barcode Number"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.fetchButton} onPress={handleManualFetch}>
              <Text style={styles.fetchButtonText}>Fetch from OFF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={addOrEditMenuItem}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Save Changes' : 'Add Item'}
              </Text>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={[styles.submitButton, styles.cancelButton]}
                onPress={resetForm}
              >
                <Text style={[styles.submitButtonText, { color: '#d9534f' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Light gray background
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  linkText: {
    fontSize: 16,
    color: '#007BFF',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  // Menu Items (top half)
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  itemInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  editButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#d9534f',
    fontWeight: '600',
  },

  // QR Code section
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginTop: 16,
  },

  // Form
  formContainer: {
    marginTop: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  allergenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  checkboxContainer: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },

  scanButton: {
    backgroundColor: '#007BFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  fetchButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007BFF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  fetchButtonText: {
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d9534f',
  },
});
