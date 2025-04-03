import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923', // Dark background
    padding: 16,
  },
  calculatorCard: {
    backgroundColor: 'rgba(30, 32, 42, 0.9)', // Glass morphism background
    borderRadius: 12,
    padding: 20,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)', // Purple border
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  calculateButton: {
    backgroundColor: '#6b46c1', // Primary purple
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'rgba(107, 70, 193, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 70, 193, 0.2)',
  },
  resultLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  resultValue: {
    color: '#6b46c1', // Primary purple
    fontSize: 18,
    fontWeight: '600',
  },
  infoButton: {
    backgroundColor: '#6b46c1', // Primary purple
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e53e3e', // Error red
    textAlign: 'center',
    marginTop: 8,
  },
});

export default styles;
