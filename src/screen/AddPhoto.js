import React, { useState, useContext } from 'react';
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

const AddPhoto = ({ navigation }) => {
  const { state } = useContext(AuthContext);
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!photo || !name || !description) {
      Alert.alert('Error', 'Please fill all fields');
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

      Alert.alert('Success', 'Photo added successfully!');
      setPhoto('');
      setName('');
      setDescription('');
      setPreviewVisible(false);
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Failed to add photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="images-outline" size={40} color="#1e90ff" />
        <Text style={styles.title}>Add New Photo</Text>
      </View>

      <View style={styles.form}>
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
    backgroundColor: '#121212', // Disesuaikan dengan dark theme
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
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  descriptionInput: {
    height: 100,
    paddingTop: 12,
  },
  previewContainer: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: '#1e1e1e',
  },
  addButton: {
    backgroundColor: '#1e90ff',
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