import createDataContext from './createDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'add_error':
      return { ...state, errorMessage: action.payload };
    case 'signin':
      return { 
        errorMessage: '', 
        token: action.payload.token, 
        user: action.payload.user 
      };
    case 'clear_error_message':
      return { ...state, errorMessage: '' };
    case 'signout':
      return { token: null, errorMessage: '', user: null };
    default:
      return state;
  }
};

const clearErrorMessage = (dispatch) => () => {
  dispatch({ type: 'clear_error_message' });
};

const signup = (dispatch) => async ({ username, email, password }) => {
  try {
      console.log('Register request data:', { username, email, password }); // Debug log
      const response = await axios.post('http://192.168.1.4:5000/api/users/register', {
          username,
          email,
          password,
      });
      dispatch({ type: 'clear_error_message' });
  } catch (err) {
      console.error('Register error response:', err.response?.data || err.message); // Debug log
      dispatch({
          type: 'add_error',
          payload: err.response?.data?.message || 'Registration failed',
      });
  }
};

const signin = (dispatch) => async ({ username, password }) => {
  try {
      console.log('Attempting to sign in:', { username, password }); // Debug log
      const response = await axios.post('http://192.168.1.4:5000/api/users/login', {
          username,
          password,
      });

      // Fallback untuk mencegah AsyncStorage crash
      const token = response.data?.token || ''; // Gunakan string kosong jika token undefined
      const user = response.data || {}; // Gunakan object kosong jika user undefined

      console.log('Saving to AsyncStorage with fallback:', { token, user }); // Debug log
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      dispatch({
          type: 'signin',
          payload: {
              token,
              user,
          },
      });
  } catch (err) {
      console.error('Login error:', err.response?.data || err.message); // Debug log
      dispatch({
          type: 'add_error',
          payload: err.response?.data?.message || 'Invalid username or password',
      });
  }
};




const tryLocalSignin = (dispatch) => async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');

    if (token && user) {
      console.log('Local sign in successful'); // Debug log
      dispatch({
        type: 'signin',
        payload: {
          token,
          user: JSON.parse(user),
        },
      });
    } else {
      console.warn('No valid token or user data found'); // Debug log
      dispatch({
        type: 'add_error',
        payload: 'Session expired. Please log in again.',
      });
    }
  } catch (err) {
    console.error('Error during local sign in:', err.message); // Debug log
    dispatch({
      type: 'add_error',
      payload: 'An error occurred. Please try again.',
    });
  }
};

const signout = (dispatch) => async () => {
  try {
    console.log('Removing token...');
    await AsyncStorage.removeItem('token'); // Hapus token
    dispatch({ type: 'signout' }); // Perbarui state token menjadi null
    console.log('Token removed and state updated');
  } catch (err) {
    console.error('Error during logout:', err.message);
  }
};



export const { Provider, Context } = createDataContext(
  authReducer,
  { signin, signup, signout, clearErrorMessage, tryLocalSignin },
  { token: null, errorMessage: '', user: null }
);