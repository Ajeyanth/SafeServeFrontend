import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthStack';
import api from '../api/api';
import { storeToken } from '../utils/authStorage';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  try {
    // Step 1: Authenticate and get tokens
    const response = await api.post('/users/token/', { username, password });
    const { access } = response.data;
    await storeToken(access);

    // Step 2: Fetch user details
    const userInfo = await api.get('/users/me/'); // Fetch the role
    if (userInfo.data.role === 'owner') {
      navigation.replace('OwnerStack');
    } else {
      navigation.replace('CustomerStack');
    }
  } catch (error) {
    if (error.response?.status === 401) {
      Alert.alert('Login Failed', 'Invalid username or password.');
    } else {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
});
