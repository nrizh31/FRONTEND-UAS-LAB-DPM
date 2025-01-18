import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Context as AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  const { state } = useContext(AuthContext);
  const [photos, setPhotos] = useState([]);
  const [likedPhotos, setLikedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [likeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    navigation.setOptions({
      title: 'Home',
      headerTitleStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
      },
      headerStyle: {
        backgroundColor: '#121212',
      },
    });
    fetchPhotos();
  }, [navigation]);

  const fetchPhotos = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get('http://192.168.1.4:5000/api/explore');
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDoubleTap = (photoId) => {
    if (!likedPhotos.includes(photoId)) {
      setLikedPhotos([...likedPhotos, photoId]);

      // Play like animation
      Animated.sequence([
        Animated.timing(likeAnimation, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(likeAnimation, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleEdit = (photo) => {
    setSelectedPhoto(photo);
    setEditedName(photo.name);
    setEditedDescription(photo.description);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://192.168.1.4:5000/api/explore/${selectedPhoto._id}`,
        {
          name: editedName,
          description: editedDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      setEditModalVisible(false);
      fetchPhotos();
      Alert.alert('Success', 'Photo updated successfully');
    } catch (error) {
      console.error('Error updating photo:', error);
      Alert.alert('Error', 'Failed to update photo');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://192.168.1.4:5000/api/explore/${id}`, {
                headers: {
                  Authorization: `Bearer ${state.token}`,
                },
              });
              fetchPhotos();
              Alert.alert('Success', 'Photo deleted successfully');
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(date));
  };

  const renderItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => handleDoubleTap(item._id)}>
      <View style={styles.photoCard}>
        <View style={styles.photoHeader}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={24} color="#999" />
            <Text style={styles.username}>{item.user?.username || 'Anonymous'}</Text>
          </View>
          {item.user?._id === state.user?._id && (
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={24} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Image source={{ uri: item.photo }} style={styles.photo} resizeMode="cover" />

        <View style={styles.photoContent}>
          <View style={styles.contentHeader}>
            <View style={styles.textContent}>
              <Text style={styles.photoName}>{item.name}</Text>
              <Text style={styles.photoDescription}>{item.description}</Text>
            </View>
            {likedPhotos.includes(item._id) && (
              <View style={styles.likeIcon}>
                <Ionicons name="heart" size={24} color="#ff4444" />
              </View>
            )}
          </View>
          <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
        </View>

        <Animated.View
          style={[
            styles.likePopup,
            {
              opacity: likeAnimation,
              transform: [{ scale: likeAnimation }],
            },
          ]}
        >
          <Ionicons name="heart" size={80} color="#ff4444" />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchPhotos}
            tintColor="#1e90ff"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        )}
      />

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Photo</Text>

            <TextInput
              style={styles.modalInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Photo Name"
              placeholderTextColor="#666"
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Description"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  photoCard: {
    backgroundColor: '#1e1e1e',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    marginHorizontal: 10,
    marginTop: 10,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: '#2a2a2a',
  },
  likeIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
  },
  photoContent: {
    padding: 15,
  },
  photoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
  photoDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  modalTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  saveButton: {
    backgroundColor: '#1e90ff',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
});

export default HomeScreen;