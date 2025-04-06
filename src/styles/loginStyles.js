import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loginBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(30, 32, 42, 0.9)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#6b46c1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#6b46c1',
    fontSize: 14,
  },
  forgotPasswordLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#4a90e2',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  createAccountLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#666',
    fontSize: 14,
  },
});
