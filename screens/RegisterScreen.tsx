import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import api from '../api/api';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'owner'>('customer'); // Default role is 'customer'

  const handleRegister = async () => {
    // Dynamically select the endpoint based on the role
    const endpoint = role === 'owner' ? '/restaurants/register-owner/' : '/users/register/';

    try {
      const response = await api.post(endpoint, {
        username,
        email,
        password,
        role,
      });
      Alert.alert('Success', `Registered as ${role} successfully!`);
      navigation.goBack(); // Navigate back to LoginScreen
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'customer' ? styles.activeRole : styles.inactiveRole]}
          onPress={() => setRole('customer')}
        >
          <Text style={styles.roleText}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'owner' ? styles.activeRole : styles.inactiveRole]}
          onPress={() => setRole('owner')}
        >
          <Text style={styles.roleText}>Restaurant Owner</Text>
        </TouchableOpacity>
      </View>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
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
    color: '#000',
  },
});
