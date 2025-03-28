import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import api from '../api/api';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer'); // Default role

  const handleRegister = async () => {
    const endpoint =
      role === 'owner'
        ? '/api/restaurants/register-owner/'
        : '/api/users/register/';

    try {
      await api.post(endpoint, {
        username,
        email,
        password,
        role,
      });
      Alert.alert('Success', `Registered as ${role} successfully!`);
      navigation.goBack(); // Return to Login
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Register</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'customer' ? styles.activeRole : styles.inactiveRole,
            ]}
            onPress={() => setRole('customer')}
          >
            <Text
              style={[
                styles.roleText,
                role === 'customer' && { color: '#fff' },
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'owner' ? styles.activeRole : styles.inactiveRole,
            ]}
            onPress={() => setRole('owner')}
          >
            <Text
              style={[
                styles.roleText,
                role === 'owner' && { color: '#fff' },
              ]}
            >
              Restaurant Owner
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitButtonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#007BFF',
    alignItems: 'center',
  },
  activeRole: {
    backgroundColor: '#007BFF',
    borderColor: '#0056b3',
  },
  inactiveRole: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  roleText: {
    color: '#007BFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
