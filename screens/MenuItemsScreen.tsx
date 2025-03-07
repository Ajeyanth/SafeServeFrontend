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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../api/api';

export default function MenuItemsScreen({ route, navigation }: any) {
  const { restaurantId } = route.params;
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); // For category data
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Selected category ID for form
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [qrCodeURL, setQRCodeURL] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

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

  const fetchCategories = async () => {
      try {
        const response = await api.get(`/restaurants/${restaurantId}/categories/`);
        console.log('Fetched categories:', response.data); // Debug log
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to fetch categories.');
      }
    };


  const addOrEditMenuItem = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    const data = { name, ingredients, allergens, category_id: selectedCategoryId };
    try {
      if (isEditing && editingItem) {
        await api.put(`/restaurants/${restaurantId}/menu/${editingItem.id}/`, data);
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...item, ...data } : item))
        );
        Alert.alert('Success', 'Menu item updated successfully!');
      } else {
        const response = await api.post(`/restaurants/${restaurantId}/menu/`, data);
        setMenuItems((prev) => [...prev, response.data]);
        Alert.alert('Success', 'Menu item added successfully!');
      }
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      Alert.alert('Error', 'Failed to save menu item.');
    }
  };

  const deleteMenuItem = async (id: number) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/restaurants/${restaurantId}/menu/${id}/`);
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

  const editMenuItem = (item: any) => {
    setIsEditing(true);
    setEditingItem(item);
    setName(item.name);
    setIngredients(item.ingredients);
    setAllergens(item.allergens);
    setSelectedCategoryId(item.category ? item.category.id : null);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingItem(null);
    setName('');
    setIngredients('');
    setAllergens('');
    setSelectedCategoryId(null);
  };

  const generateQRCode = async () => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/generate-qr/`, {
        responseType: 'blob',
      });
      const qrCodeBlob = new Blob([response.data], { type: 'image/png' });
      const qrCodeURL = URL.createObjectURL(qrCodeBlob);
      setQRCodeURL(qrCodeURL);
      Alert.alert('Success', 'QR Code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to generate QR Code.');
    }
  };

  const renderMenuItem = ({ item }: { item: any }) => (
    <View style={styles.menuItem}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text>Ingredients: {item.ingredients}</Text>
      <Text>Allergens: {item.allergens}</Text>
      <Text>Category: {item.category ? item.category.name : 'No Category'}</Text>
      <View style={styles.menuItemActions}>
        <Button title="Edit" onPress={() => editMenuItem(item)} />
        <Button title="Delete" color="red" onPress={() => deleteMenuItem(item.id)} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={menuItems}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderMenuItem}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Manage Menu Items</Text>
          {/* Link to Category Management Screen */}
          <TouchableOpacity onPress={() => navigation.navigate('CategoryManagement', { restaurantId })}>
            <Text style={styles.linkText}>Manage Categories</Text>
          </TouchableOpacity>
        </>
      }
      ListFooterComponent={
        <>
          {/* QR Code Generation */}
          <View style={styles.qrCodeSection}>
            <Button title="Generate QR Code for Menu" onPress={generateQRCode} />
            {qrCodeURL && <Image source={{ uri: qrCodeURL }} style={styles.qrCode} />}
          </View>
          {/* Menu Item Form */}
          <View style={styles.addForm}>
            <Text style={styles.subtitle}>{isEditing ? 'Edit Menu Item' : 'Add Menu Item'}</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Ingredients (comma separated)" value={ingredients} onChangeText={setIngredients} />
            <TextInput style={styles.input} placeholder="Allergens (comma separated)" value={allergens} onChangeText={setAllergens} />
            {/* Category Picker */}
            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
              style={styles.input}
            >
              <Picker.Item label="Select Category" value={null} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
            <Button title={isEditing ? 'Save Changes' : 'Add Item'} onPress={addOrEditMenuItem} />
            {isEditing && <Button title="Cancel" color="red" onPress={resetForm} />}
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 16,
  },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 4 },
  menuItem: { padding: 16, marginBottom: 12, backgroundColor: '#f9f9f9', borderRadius: 4, borderWidth: 1, borderColor: '#ddd' },
  menuItemName: { fontSize: 16, fontWeight: 'bold' },
  menuItemActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  addForm: { marginTop: 24, padding: 12, borderTopWidth: 1, borderColor: '#ccc' },
  qrCodeSection: { marginTop: 16, alignItems: 'center' },
  qrCode: { width: 200, height: 200, marginTop: 16 },
});
