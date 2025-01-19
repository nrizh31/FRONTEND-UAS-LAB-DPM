import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Context as AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AddPhoto = ({ navigation }) => {
  const { state } = useContext(AuthContext);
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'Add Photo',
      headerTitleStyle: {
        fontFamily: 'Dancing-Script',
        fontSize: 30,
        fontWeight: 'normal',
        color: '#FFFFFF',
      },
      headerStyle: {
        backgroundColor: '#03DAC6', // Warna tosca
      },
    });
  }, [navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setPreviewVisible(true);
    }
  };

  const handleSubmit = async () => {
    if (!photo || !name || !description) {
      Alert.alert(
        'Missing Fields',
        'Please fill all fields',
        [
          {
            text: 'OK',
            style: 'default',
          }
        ],
        {
          cancelable: true,
          userInterfaceStyle: 'dark',
        }
      );
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        'http://192.168.1.4:5000/api/explore',
        {
          photo: photo.trim(),
          name: name.trim(),
          description: description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      Alert.alert(
        'Success',
        'Photo added successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setPhoto('');
              setName('');
              setDescription('');
              setPreviewVisible(false);
              navigation.goBack(); // Optional: navigate back after success
            },
            style: 'default',
          }
        ],
        {
          cancelable: false,
          userInterfaceStyle: 'dark',
        }
      );
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert(
        'Error',
        'Failed to add photo. Please try again.',
        [
          {
            text: 'OK',
            style: 'default',
          }
        ],
        {
          cancelable: true,
          userInterfaceStyle: 'dark',
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="images-outline" size={40} color="#03DAC6" />
        <Text style={styles.title}>Add New Photo</Text>
      </View>

      <View style={styles.uploadOptions}>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickImage}
        >
          <Ionicons name="image" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Choose from Device</Text>
        </TouchableOpacity>
        
        <Text style={styles.orText}>OR</Text>
        
        <TextInput
          placeholder="Enter image URL"
          value={photo}
          onChangeText={(text) => {
            setPhoto(text);
            setPreviewVisible(!!text);
          }}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
      </View>

      {previewVisible && photo && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: photo }}
            style={styles.preview}
            resizeMode="cover"
            onError={() => console.log('Image preview failed')}
          />
        </View>
      )}

      <View style={styles.form}>
        <TextInput
          placeholder="Photo Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#666"
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.descriptionInput]}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholderTextColor="#666"
        />

        <TouchableOpacity
          style={[
            styles.addButton,
            isLoading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Adding Photo...' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E', // Warna Claude.ai
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
  uploadOptions: {
    padding: 20,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#03DAC6', // Warna tosca
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#121212', // Warna dalam border hitam
    color: '#fff',
  },
  descriptionInput: {
    height: 100,
    paddingTop: 12,
  },
  previewContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: '#121212',
  },
  addButton: {
    backgroundColor: '#03DAC6', // Warna tosca
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddPhoto;