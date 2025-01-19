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
import * as Share from 'expo-sharing';

const CustomAlert = ({ visible, title, message, onClose }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
  >
    <View style={styles.alertOverlay}>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>
        <TouchableOpacity 
          style={styles.alertButton} 
          onPress={onClose}
        >
          <Text style={styles.alertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const DeleteConfirmationAlert = ({ visible, onConfirm, onCancel }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
  >
    <View style={styles.alertOverlay}>
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>Delete Photo</Text>
        <Text style={styles.alertMessage}>Are you sure you want to delete this photo?</Text>
        <View style={styles.alertButtonContainer}>
          <TouchableOpacity 
            style={[styles.alertButton, styles.cancelButton]} 
            onPress={onCancel}
          >
            <Text style={styles.alertButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.alertButton, styles.deleteButton]} 
            onPress={onConfirm}
          >
            <Text style={styles.alertButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const EditModal = ({ visible, onClose, onSave, name, setName, description, setDescription }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.alertOverlay}>
      <View style={[styles.alertContent, styles.editModalContent]}>
        <Text style={styles.alertTitle}>Edit Photo</Text>

        <TextInput
          style={styles.modalInput}
          value={name}
          onChangeText={setName}
          placeholder="Photo Name"
          placeholderTextColor="#666"
        />

        <TextInput
          style={[styles.modalInput, styles.modalTextArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
        />

        <View style={styles.alertButtonContainer}>
          <TouchableOpacity
            style={[styles.alertButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.alertButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.alertButton, styles.saveButton]}
            onPress={onSave}
          >
            <Text style={styles.alertButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

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
  const [comments, setComments] = useState({});
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: ''
  });
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'PhotoGram',
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

  const handleDoubleTap = async (photoId) => {
    try {
      if (!likedPhotos.includes(photoId)) {
        setLikedPhotos([...likedPhotos, photoId]);
        
        // Play like animation
        Animated.sequence([
          Animated.timing(likeAnimation, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(likeAnimation, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleLikePress = (photoId) => {
    if (likedPhotos.includes(photoId)) {
      // Unlike: remove from likedPhotos
      setLikedPhotos(likedPhotos.filter(id => id !== photoId));
    } else {
      // Like: add to likedPhotos
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
      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Photo updated successfully'
      });
    } catch (error) {
      console.error('Error updating photo:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to update photo'
      });
    }
  };

  const handleDelete = (id) => {
    setPhotoToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://192.168.1.4:5000/api/explore/${photoToDelete}`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      setDeleteConfirmVisible(false);
      fetchPhotos();
      setAlertConfig({
        visible: true,
        title: 'Success',
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting photo:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to delete photo'
      });
    }
  };

  const handleComment = (photoId) => {
    setSelectedPhotoId(photoId);
    setCommentsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeCommentModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCommentsModalVisible(false);
      setCommentText('');
    });
  };

  const handleShare = async (photo) => {
    try {
      const result = await Share.share({
        message: `Check out this photo by ${photo.user?.username || 'Anonymous'}: ${photo.description}`,
        url: photo.photo // URL gambar
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share photo');
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(date));
  };

  const renderItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => handleDoubleTap(item._id)}>
      <View style={styles.photoCard}>
        <View style={styles.photoHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle-outline" size={32} color="#999" />
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>{item.user?.username || 'Anonymous'}</Text>
              <Text style={styles.location}>Jakarta, Indonesia</Text>
            </View>
          </View>
          {item.user?._id === state.user?._id && (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => handleDelete(item._id)}
              >
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Image source={{ uri: item.photo }} style={styles.photo} resizeMode="cover" />

        <View style={styles.actionBar}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleLikePress(item._id)}>
              {likedPhotos.includes(item._id) ? (
                <Ionicons name="heart" size={28} color="#ff4444" />
              ) : (
                <Ionicons name="heart-outline" size={28} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleComment(item._id)}>
              <Ionicons name="chatbubble-outline" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={() => handleShare(item)}>
              <Ionicons name="paper-plane-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="bookmark-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.photoContent}>
          <Text style={styles.photoName}>{item.name}</Text>
          <Text style={styles.caption}>{item.description}</Text>
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

      <EditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleUpdate}
        name={editedName}
        setName={setEditedName}
        description={editedDescription}
        setDescription={setEditedDescription}
      />

      <Modal
        visible={commentsModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeCommentModal}
      >
        <TouchableWithoutFeedback onPress={closeCommentModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.commentModal,
                  {
                    transform: [
                      {
                        translateY: modalAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [300, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.commentHeader}>
                  <Text style={styles.commentTitle}>Comments</Text>
                  <TouchableOpacity onPress={closeCommentModal}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.commentsList}>
                  <Text style={styles.noComments}>No comments yet</Text>
                </View>

                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="#666"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={styles.postButton}
                    onPress={() => {
                      // Handle post comment
                      setCommentText('');
                    }}
                  >
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      <DeleteConfirmationAlert
        visible={deleteConfirmVisible}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  photoCard: {
    backgroundColor: '#121212',
    marginBottom: 16,
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 10,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    color: '#fff',
  },
  location: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
  },
  photo: {
    width: '100%',
    height: 400,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 16,
  },
  photoContent: {
    paddingHorizontal: 12,
    paddingBottom: 0,
  },
  photoName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  caption: {
    color: '#fff',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 27, 30, 0.9)',
    justifyContent: 'flex-end',
    padding: 24,
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
    backgroundColor: '#03DAC6',
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
  likePopup: {
    position: 'absolute',
    top: 200,
    left: 120,
    transform: [{ scale: 0 }],
    opacity: 0,
  },
  commentModal: {
    backgroundColor: '#121212',
    borderRadius: 24,
    height: '45%',
    padding: 32,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  commentTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    marginBottom: 16,
  },
  noComments: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 16,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    marginRight: 8,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postButtonText: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContent: {
    backgroundColor: '#1A1B1E',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  alertTitle: {
    color: '#03DAC6',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#03DAC6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  editModalContent: {
    width: '90%',
    maxWidth: 400,
  },
  saveButton: {
    backgroundColor: '#03DAC6',
  },
});

export default HomeScreen;
