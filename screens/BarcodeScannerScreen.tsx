import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { RNCamera } from 'react-native-camera';

export default function BarcodeScannerScreen({ route, navigation }: any) {
  // Callback passed from the parent screen (MenuItemsScreen)
  const { onScanComplete } = route.params;

  // For scanning state
  const [scanned, setScanned] = useState(false);

  // For manually typed barcode
  const [typedBarcode, setTypedBarcode] = useState('');

  useEffect(() => {
    // If on Android, request camera permission at runtime
    if (Platform.OS === 'android') {
      requestCameraPermission();
    }
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'SafeServe needs access to your camera to scan barcodes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('No access to camera', 'Camera permission was not granted.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Called automatically when the camera detects a barcode
  const handleBarCodeRead = ({ type, data }: { type: string; data: string }) => {
    // If we've already processed a scan, skip
    if (scanned) return;
    setScanned(true);

    Alert.alert('Scanned!', `Barcode type: ${type}\nData: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          if (onScanComplete) {
            onScanComplete(data);
          }
          navigation.goBack();
        },
      },
    ]);
  };

  // Handle manual entry
  const handleManualSubmit = () => {
    if (!typedBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode number.');
      return;
    }
    // Call the parent callback with typed barcode
    if (onScanComplete) {
      onScanComplete(typedBarcode.trim());
    }
    navigation.goBack();
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>

      {/* Camera preview (only if not scanned) */}
      {!scanned && (
        <RNCamera
          style={styles.camera}
          onBarCodeRead={handleBarCodeRead}
          captureAudio={false} // We don't need audio for barcode scanning
          type={RNCamera.Constants.Type.back}
          androidCameraPermissionOptions={{
            title: 'Camera Permission',
            message: 'SafeServe needs access to your camera to scan barcodes.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }}
        />
      )}

      {/* When scanned, offer "Scan again" */}
      {scanned && (
        <Button title="Scan again" onPress={handleScanAgain} />
      )}

      {/* A cancel button at all times */}
      <Button title="Cancel" onPress={handleCancel} color="#999" />

      {/* Manual Entry Section */}
      <View style={styles.manualContainer}>
        <Text style={styles.manualTitle}>Or Enter Barcode Manually:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1234567890123"
          keyboardType="numeric"
          value={typedBarcode}
          onChangeText={setTypedBarcode}
        />
        <Button title="Submit Barcode" onPress={handleManualSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  manualContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
});
