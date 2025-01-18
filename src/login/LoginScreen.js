import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Context as AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme } from '../theme';

const LoginScreen = ({ navigation }) => {
  const { state, signin, clearErrorMessage } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.token) {
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    }
  }, [state.token]);

  const handleLogin = async () => {
    setLoading(true);
    clearErrorMessage();
    try {
      await signin({ username, password });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://i.pinimg.com/736x/81/b7/0d/81b70d4eae6ffb1e3250bc404982caa7.jpg' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome Back!</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>

      {state.errorMessage && (
        <Text style={styles.errorMessage}>{state.errorMessage}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? Sign up here</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkTheme.text.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: darkTheme.input.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: darkTheme.input.background,
    color: darkTheme.text.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkTheme.input.border,
    borderRadius: 10,
    backgroundColor: darkTheme.input.background,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingHorizontal: 15,
    color: darkTheme.text.primary,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: darkTheme.button.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: darkTheme.button.disabled,
  },
  buttonText: {
    color: darkTheme.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: darkTheme.accent,
    marginBottom: 15,
    textAlign: 'center',
  },
  linkText: {
    color: darkTheme.primary,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;