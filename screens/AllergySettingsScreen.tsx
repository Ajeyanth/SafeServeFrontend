import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import api from '../api/api';

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

export default function AllergySettingsScreen() {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergies, setCustomAllergies] = useState('');

  useEffect(() => {
    fetchUserAllergies();
  }, []);

  // Load the user's existing dietary restrictions
  const fetchUserAllergies = async () => {
    try {
      const response = await api.get('/api/users/me/');
      const existingAllergies = response.data.dietary_restrictions || '';

      // Split them into an array (assuming comma-separated) and see which match known allergens
      const parsedAllergies = existingAllergies
        .split(',')
        .map((a: string) => a.trim())
        .filter((a: string) => a.length > 0);

      // For any that match known allergens, add them to selectedAllergens
      const matchedAllergens = parsedAllergies.filter((allergen: string) =>
        KNOWN_ALLERGENS.includes(allergen)
      );

      // For any that don't match known allergens, place them in customAllergies
      const custom = parsedAllergies
        .filter((a: string) => !KNOWN_ALLERGENS.includes(a))
        .join(',');

      setSelectedAllergens(matchedAllergens);
      setCustomAllergies(custom);
    } catch (error) {
      console.error('Error fetching user allergies', error);
    }
  };

  // Toggle a known allergen on/off
  const handleToggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) => {
      if (prev.includes(allergen)) {
        // remove it
        return prev.filter((item) => item !== allergen);
      } else {
        // add it
        return [...prev, allergen];
      }
    });
  };

  const handleSave = async () => {
    try {
      // Combine known allergens + custom allergies into one string
      // Remove duplicates and empty strings
      const allAllergies = [
        ...selectedAllergens,
        ...customAllergies
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
      ];

      const uniqueAllergies = Array.from(new Set(allAllergies));
      const dietaryRestrictions = uniqueAllergies.join(',');

      // Update the user’s dietary_restrictions
      await api.patch('/api/users/me/', {
        dietary_restrictions: dietaryRestrictions,
      });

      Alert.alert('Success', 'Allergies updated!');
    } catch (error) {
      console.error('Error saving allergies', error);
      Alert.alert('Error', 'Failed to save allergies. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Your Allergies</Text>

      {/* KNOWN ALLERGENS */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Known Allergens</Text>
        {KNOWN_ALLERGENS.map((allergen) => {
          const isSelected = selectedAllergens.includes(allergen);
          return (
            <Pressable
              key={allergen}
              onPress={() => handleToggleAllergen(allergen)}
              style={styles.allergenRow}
            >
              <Text
                style={[
                  styles.allergenLabel,
                  isSelected && { fontWeight: 'bold' },
                ]}
              >
                {isSelected ? '☑' : '☐'} {allergen}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* CUSTOM ALLERGIES */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Other / Custom Allergies</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Coconut, Chocolate..."
          value={customAllergies}
          onChangeText={setCustomAllergies}
        />
      </View>

      {/* SAVE BUTTON */}
      <Pressable style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

// STYLE SHEET
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    alignSelf: 'center',
  },
  sectionContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,

    // Android elevation
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  allergenRow: {
    paddingVertical: 4,
  },
  allergenLabel: {
    fontSize: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,

    // Android elevation
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
