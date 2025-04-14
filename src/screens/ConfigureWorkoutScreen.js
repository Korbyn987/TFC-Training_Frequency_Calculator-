import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

const ConfigureWorkoutScreen = ({ route, navigation }) => {
  const { exercises } = route.params;
  const [workoutName, setWorkoutName] = useState('');
  const [configuredExercises, setConfiguredExercises] = useState(
    exercises.map(exercise => ({
      ...exercise,
      sets: '3',
      reps: '12',
      weight: '',
      notes: '',
      lastPerformance: null,
      recommendation: null,
      goal: null,
    }))
  );
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [weightHistoryVisible, setWeightHistoryVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({
    targetWeight: '',
    targetDate: '',
    weeklyIncrement: '',
    notes: '',
  });
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const user = useSelector(state => state.auth.user);

  const [weightHistory, setWeightHistory] = useState([]);

  useEffect(() => {
    if (selectedExercise) {
      fetchWeightHistory(selectedExercise.id);
      fetchExerciseGoal(selectedExercise.id);
    }
  }, [selectedExercise]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchExerciseGoal = async (exerciseId) => {
    try {
      // TODO: Replace with actual API call
      const mockGoal = {
        targetWeight: 225,
        targetDate: '2025-07-13',
        startWeight: 135,
        startDate: '2025-04-13',
        weeklyIncrement: 2.5,
        status: 'In Progress',
        notes: 'Working towards two plates'
      };
      
      setConfiguredExercises(prev => 
        prev.map(ex => 
          ex.id === exerciseId 
            ? { ...ex, goal: mockGoal }
            : ex
        )
      );
    } catch (error) {
      console.error('Error fetching exercise goal:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTemplates = [
        {
          id: 1,
          name: 'Beginner Strength',
          description: 'Steady progression for beginners',
          durationWeeks: 12,
          weeklyIncrement: 2.5,
        },
        {
          id: 2,
          name: 'Intermediate Push',
          description: 'Moderate progression for chest/shoulders',
          durationWeeks: 8,
          weeklyIncrement: 5.0,
        },
        {
          id: 3,
          name: 'Advanced Percentage',
          description: 'Percentage-based progression',
          durationWeeks: 6,
          percentageIncrease: 2.5,
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const calculateProgress = (goal) => {
    if (!goal) return null;

    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const totalDays = (targetDate - startDate) / (1000 * 60 * 60 * 24);
    const daysElapsed = (today - startDate) / (1000 * 60 * 60 * 24);
    const progressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

    const weightDiff = goal.targetWeight - goal.startWeight;
    const expectedProgress = (weightDiff / totalDays) * daysElapsed;
    const expectedWeight = goal.startWeight + expectedProgress;

    return {
      progressPercent,
      expectedWeight: Math.round(expectedWeight * 2) / 2, // Round to nearest 0.5
      daysRemaining: Math.max(0, Math.floor(totalDays - daysElapsed)),
    };
  };

  const applyTemplate = (template) => {
    const startWeight = parseFloat(selectedExercise.lastPerformance?.weight) || 0;
    const startDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + template.durationWeeks * 7);

    let targetWeight;
    if (template.percentageIncrease) {
      targetWeight = startWeight * (1 + template.percentageIncrease / 100);
    } else {
      targetWeight = startWeight + (template.weeklyIncrement * template.durationWeeks);
    }

    setNewGoal({
      targetWeight: targetWeight.toFixed(2),
      targetDate: targetDate.toISOString().split('T')[0],
      weeklyIncrement: template.weeklyIncrement?.toString() || '',
      notes: `Using ${template.name} template: ${template.description}`,
    });

    setSelectedTemplate(template);
  };

  const saveGoal = async () => {
    if (!newGoal.targetWeight || !newGoal.targetDate) {
      Alert.alert('Error', 'Please fill in target weight and date');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const goal = {
        ...newGoal,
        startWeight: parseFloat(selectedExercise.lastPerformance?.weight) || 0,
        startDate: new Date().toISOString().split('T')[0],
        status: 'In Progress'
      };

      setConfiguredExercises(prev => 
        prev.map(ex => 
          ex.id === selectedExercise.id 
            ? { ...ex, goal }
            : ex
        )
      );

      setGoalModalVisible(false);
      setNewGoal({
        targetWeight: '',
        targetDate: '',
        weeklyIncrement: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const GoalModal = () => (
    <Modal
      visible={goalModalVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Weight Goal</Text>
            <Text style={styles.exerciseTitle}>{selectedExercise?.name}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setGoalModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.templatesContainer}>
              <Text style={styles.sectionTitle}>Goal Templates</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.templatesList}
              >
                {templates.map(template => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateCard,
                      selectedTemplate?.id === template.id && styles.selectedTemplate
                    ]}
                    onPress={() => applyTemplate(template)}
                  >
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateDescription}>{template.description}</Text>
                    <View style={styles.templateStats}>
                      <Text style={styles.templateStat}>
                        {template.durationWeeks} weeks
                      </Text>
                      <Text style={styles.templateStat}>
                        {template.percentageIncrease 
                          ? `+${template.percentageIncrease}%` 
                          : `+${template.weeklyIncrement} lbs/week`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={newGoal.targetWeight}
                onChangeText={(value) => setNewGoal(prev => ({ ...prev, targetWeight: value }))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Date</Text>
              <TextInput
                style={styles.input}
                value={newGoal.targetDate}
                onChangeText={(value) => setNewGoal(prev => ({ ...prev, targetDate: value }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weekly Increment (lbs)</Text>
              <TextInput
                style={styles.input}
                value={newGoal.weeklyIncrement}
                onChangeText={(value) => setNewGoal(prev => ({ ...prev, weeklyIncrement: value }))}
                keyboardType="numeric"
                placeholder="2.5"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={newGoal.notes}
                onChangeText={(value) => setNewGoal(prev => ({ ...prev, notes: value }))}
                placeholder="Add notes about your goal..."
                placeholderTextColor="#666"
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveGoal}
            >
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderExerciseItem = ({ item, index }) => {
    const progress = item.goal ? calculateProgress(item.goal) : null;

    return (
      <View style={styles.exerciseCard}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sets</Text>
            <TextInput
              style={styles.input}
              value={item.sets}
              onChangeText={(value) => updateExerciseConfig(index, 'sets', value)}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reps</Text>
            <TextInput
              style={styles.input}
              value={item.reps}
              onChangeText={(value) => updateExerciseConfig(index, 'reps', value)}
              keyboardType="number-pad"
              placeholder="12"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (lbs)</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={[styles.input, styles.weightInput]}
                value={item.weight}
                onChangeText={(value) => updateExerciseConfig(index, 'weight', value)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => {
                  setSelectedExercise(item);
                  setWeightHistoryVisible(true);
                }}
              >
                <Ionicons name="time-outline" size={20} color="#6b46c1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {item.goal ? (
          <View style={styles.goalContainer}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Weight Goal</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedExercise(item);
                  setGoalModalVisible(true);
                }}
              >
                <Text style={styles.editGoal}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${progress?.progressPercent || 0}%` }
                  ]} 
                />
              </View>
              <View style={styles.goalStats}>
                <Text style={styles.goalText}>
                  Target: {item.goal.targetWeight} lbs
                </Text>
                <Text style={styles.goalText}>
                  Expected: {progress?.expectedWeight} lbs
                </Text>
                <Text style={styles.goalText}>
                  {progress?.daysRemaining} days left
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addGoalButton}
            onPress={() => {
              setSelectedExercise(item);
              setGoalModalVisible(true);
            }}
          >
            <Ionicons name="flag-outline" size={20} color="#6b46c1" />
            <Text style={styles.addGoalText}>Set Weight Goal</Text>
          </TouchableOpacity>
        )}

        <View style={styles.notesContainer}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={item.notes}
            onChangeText={(value) => updateExerciseConfig(index, 'notes', value)}
            placeholder="Add notes for this exercise..."
            placeholderTextColor="#666"
            multiline
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.workoutNameInput}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Enter Workout Name"
          placeholderTextColor="#666"
        />
      </View>

      <FlatList
        data={configuredExercises}
        renderItem={renderExerciseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.exerciseList}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWorkout}
        >
          <Text style={styles.saveButtonText}>Save Workout</Text>
          <Ionicons name="save-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <WeightHistoryModal />
      <GoalModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171923',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  workoutNameInput: {
    fontSize: 20,
    color: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2D3748',
    borderRadius: 8,
  },
  exerciseList: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    color: '#ffffff',
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1A202C',
    borderRadius: 6,
    padding: 8,
    color: '#ffffff',
    textAlign: 'center',
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    flex: 1,
    marginRight: 8,
  },
  historyButton: {
    padding: 8,
    backgroundColor: '#1A202C',
    borderRadius: 6,
  },
  notesContainer: {
    marginTop: 8,
  },
  notesInput: {
    backgroundColor: '#1A202C',
    borderRadius: 6,
    padding: 8,
    color: '#ffffff',
    height: 60,
    textAlignVertical: 'top',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A202C',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b46c1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#171923',
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  exerciseTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  historyDate: {
    color: '#ffffff',
    fontSize: 16,
  },
  historySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  historyDetails: {
    flexDirection: 'row',
  },
  historyText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 16,
  },
  emptyHistory: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    padding: 16,
  },
  goalContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1A202C',
    borderRadius: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editGoal: {
    color: '#6b46c1',
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2D3748',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6b46c1',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  goalText: {
    color: '#ffffff',
    fontSize: 12,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
    backgroundColor: '#1A202C',
    borderRadius: 8,
  },
  addGoalText: {
    color: '#6b46c1',
    marginLeft: 8,
    fontSize: 14,
  },
  modalBody: {
    padding: 16,
  },
  templatesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  templatesList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  templateCard: {
    backgroundColor: '#2D3748',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  selectedTemplate: {
    backgroundColor: '#4A5568',
    borderColor: '#6b46c1',
    borderWidth: 2,
  },
  templateName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  templateDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 8,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  templateStat: {
    color: '#6b46c1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D3748',
    marginVertical: 20,
  },
  recommendationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    padding: 4,
    borderRadius: 4,
  },
  recommendationText: {
    color: '#ffffff',
    fontSize: 12,
    marginLeft: 4,
  },
  recommendationincrease: {
    backgroundColor: '#48BB78',
  },
  recommendationdecrease: {
    backgroundColor: '#F56565',
  },
  recommendationmaintain: {
    backgroundColor: '#4299E1',
  },
});

export default ConfigureWorkoutScreen;
