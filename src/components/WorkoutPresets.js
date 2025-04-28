import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = "workout_presets";

const WorkoutPresets = () => {
  const [presets, setPresets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [name, setName] = useState("");
  const [presetExercises, setPresetExercises] = useState([]);
  const [exerciseSelectorVisible, setExerciseSelectorVisible] = useState(false);
  const [pendingPreset, setPendingPreset] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    loadPresets();
  }, []);

  // Helper: check if AddExerciseScreen is the current/active route
  const isAddExerciseScreenActive = () => {
    const state = navigation.getState && navigation.getState();
    if (!state) return false;
    const lastRoute = state.routes[state.routes.length - 1];
    return lastRoute && lastRoute.name === 'AddExercise';
  };

  useFocusEffect(
    React.useCallback(() => {
      const state = navigation.getState && navigation.getState();
      if (!state) return;
      const profileRoute = state.routes.find(r => r.name === 'Profile');
      const addExerciseActive = state.routes[state.routes.length - 1]?.name === 'AddExercise';
      if (
        profileRoute &&
        profileRoute.params &&
        profileRoute.params.selectedExercisesForPreset &&
        profileRoute.params.showPresetModal &&
        !addExerciseActive
      ) {
        const newExercises = profileRoute.params.selectedExercisesForPreset;
        setModalVisible(false);
        setTimeout(() => {
          setPresetExercises(newExercises);
          setName(pendingPreset?.name || "");
          setEditingPreset(pendingPreset?.editingPreset || null);
          setPendingPreset({
            name: pendingPreset?.name || "",
            exercises: newExercises,
            editingPreset: pendingPreset?.editingPreset || null,
            pendingAddExercise: false
          });
          setModalVisible(true);
          navigation.setParams({ selectedExercisesForPreset: undefined, showPresetModal: undefined });
        }, 350);
      }
    }, [navigation, pendingPreset, modalVisible])
  );

  // Remove auto-reopen modal logic to prevent double modal after AddExercise
  // (This was causing the modal to open twice: once from navigation effect, once from here)
  // useEffect(() => {
  //   if (modalVisible === false && pendingPreset && presetExercises.length > 0) {
  //     setName(pendingPreset.name);
  //     setEditingPreset(pendingPreset.editingPreset || null);
  //     setModalVisible(true);
  //     setPendingPreset(null);
  //   }
  // }, [modalVisible, pendingPreset, presetExercises]);

  // Remove defensive always-open modal logic for new preset flow (prevents double modal)
  // useEffect(() => {
  //   if (pendingPreset && !modalVisible) {
  //     setModalVisible(true);
  //   }
  // }, [pendingPreset, modalVisible]);

  const loadPresets = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) setPresets(JSON.parse(data));
  };

  const savePresets = async (newPresets) => {
    setPresets(newPresets);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
  };

  const openModal = (preset = null) => {
    setEditingPreset(preset);
    setName(preset ? preset.name : "");
    setPresetExercises(preset ? preset.exercises : []);
    setPendingPreset(preset ? { ...preset } : { name: '', exercises: [] });
    setModalVisible(true);
  };

  const closeModal = () => {
    setEditingPreset(null);
    setName("");
    setPresetExercises([]);
    setPendingPreset(null);
    setModalVisible(false);
  };

  const handleSave = () => {
    let newPresets;
    if (editingPreset) {
      newPresets = presets.map(p =>
        p.id === editingPreset.id ? { ...p, name, exercises: presetExercises } : p
      );
    } else {
      newPresets = [
        ...presets,
        { id: Date.now(), name, exercises: presetExercises }
      ];
    }
    savePresets(newPresets);
    closeModal();
  };

  const handleDelete = (id) => {
    const newPresets = presets.filter(p => p.id !== id);
    savePresets(newPresets);
  };

  // Smoother, race-condition-free navigation to AddExercise
  const handleAddExerciseNav = () => {
    // Save current preset state and mark navigation intent
    setPendingPreset({
      name,
      exercises: presetExercises,
      editingPreset,
      pendingAddExercise: true
    });
    // Animate modal out, then navigate after animation completes
    setModalVisible(false);
    // Use InteractionManager to guarantee all animations and state flush before navigation
    import('react-native').then(({ InteractionManager }) => {
      InteractionManager.runAfterInteractions(() => {
        setPendingPreset(prev => prev ? { ...prev, pendingAddExercise: false } : prev);
        navigation.navigate('AddExercise', {
          previousExercises: presetExercises,
          returnToPreset: true
        });
      });
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Workout Presets</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={presets}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.presetCard}
            onPress={() => openModal(item)}
          >
            <Text style={styles.presetName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No presets yet.</Text>}
      />
      {/* Always show modal if modalVisible is true and AddExerciseScreen is NOT active (removes extra isFocused and pendingAddExercise checks) */}
      <Modal visible={modalVisible && !isAddExerciseScreenActive()} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close (X) button in top right */}
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => { setModalVisible(false); navigation.navigate('Profile'); }}
            >
              <Ionicons name="close" size={28} color="#888" />
            </TouchableOpacity>
            <ScrollView>
              <Text style={styles.modalTitle}>{editingPreset ? "Edit Preset" : "New Preset"}</Text>
              <TextInput
                style={styles.input}
                placeholder="Preset Name"
                value={name}
                onChangeText={setName}
              />
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "bold", color: "#6b46c1", marginBottom: 6 }}>Exercises:</Text>
                <FlatList
                  data={presetExercises}
                  keyExtractor={(item, idx) => item.name + idx}
                  renderItem={({ item }) => (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, color: "#222" }}>{item.name}</Text>
                    </View>
                  )}
                  ListEmptyComponent={<Text style={{ color: "#666" }}>No exercises yet.</Text>}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddExerciseNav}>
                  <Text style={styles.addButtonText}>+ Add Exercise</Text>
                </TouchableOpacity>
              </View>
              <Button title="Save" color="#6b46c1" onPress={handleSave} />
              {editingPreset && (
                <TouchableOpacity
                  style={[styles.deleteButton, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }]}
                  onPress={() => handleDelete(editingPreset.id)}
                >
                  <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 0, marginBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#6b46c1", letterSpacing: 1 },
  addButton: { backgroundColor: "#6b46c1", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  presetCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, marginHorizontal: 12, shadowColor: "#6b46c1", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: "#e3d9fa" },
  presetName: { fontSize: 16, fontWeight: "bold", color: "#6b46c1", marginBottom: 2 },
  presetExercises: { color: "#444", fontSize: 13 },
  editBtn: { color: "#6b46c1", fontWeight: "bold", marginLeft: 10, fontSize: 15 },
  deleteBtn: { color: "#e53e3e", fontWeight: "bold", marginLeft: 10, fontSize: 15 },
  empty: { color: "#666", marginTop: 20, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 14, padding: 28, width: "90%", maxHeight: "80%", shadowColor: "#6b46c1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 7, borderWidth: 1.5, borderColor: "#6b46c1" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#6b46c1", alignSelf: "center", letterSpacing: 1 },
  input: { backgroundColor: "#f3f1fa", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: "#d1c4e9" },
  deleteButton: {
    backgroundColor: '#e53e3e',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});

export default WorkoutPresets;
