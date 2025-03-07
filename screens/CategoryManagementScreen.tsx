import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import api from '../api/api';

export default function CategoryManagementScreen({ route, navigation }: any) {
  const { restaurantId } = route.params;
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/categories/`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Category name is required.');
      return;
    }
    try {
      const response = await api.post(`/restaurants/${restaurantId}/categories/`, { name: newCategory });
      setCategories((prev) => [...prev, response.data]);
      setNewCategory('');
      Alert.alert('Success', 'Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category.');
    }
  };

  const renderCategory = ({ item }: { item: any }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Categories</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategory}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="New Category Name"
        value={newCategory}
        onChangeText={setNewCategory}
      />
      <Button title="Add Category" onPress={addCategory} />
      <Button title="Back to Menu" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  categoryItem: { padding: 12, borderBottomWidth: 1, borderColor: '#ddd' },
  categoryName: { fontSize: 16 },
});
