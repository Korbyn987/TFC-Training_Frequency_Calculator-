import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, ScrollView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DeviceEventEmitter } from 'react-native';

const STORAGE_KEY = "workout_presets";

const WorkoutPresets = () => {
  const [presets, setPresets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [name, setName] = useState("");
  const [presetExercises, setPresetExercises] = useState([]);
  const [exerciseSelectorVisible, setExerciseSelectorVisible] = useState(false);
  const [pendingPreset, setPendingPreset] = useState(null);
  const [expandedPresetId, setExpandedPresetId] = useState(null);

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

  // Listen for return event once on mount
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('onReturnToPreset', (data) => {
      if (data?.presetName === name) {
        setPresetExercises(data.exercises);
        // Open modal after navigation finishes
        setTimeout(() => {
          setModalVisible(true);
        }, 300);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [name]);

  // Smoother, race-condition-free navigation to AddExercise
  const handleAddExerciseNav = () => {
    // Save current preset state and mark navigation intent
    setPendingPreset({
      name,
      exercises: presetExercises,
      editingPreset,
      pendingAddExercise: true
    });
    setModalVisible(false);
    
    // Use setTimeout to ensure modal is fully closed before navigating
    setTimeout(() => {
      setPendingPreset(prev => prev ? { ...prev, pendingAddExercise: false } : prev);
      navigation.navigate('AddExercise', {
        previousExercises: presetExercises,
        returnToPreset: true,
        presetName: name,
      });
    }, 300);
  };

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Workout Presets</Text>
      </View>
      <FlatList
        data={presets}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={[styles.presetCard, expandedPresetId === item.id && styles.presetCardActive]}
              onPress={() => setExpandedPresetId(expandedPresetId === item.id ? null : item.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.presetName}>{item.name}</Text>
              <Ionicons name={expandedPresetId === item.id ? 'chevron-up' : 'chevron-down'} size={22} color="#6b46c1" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
            
            {/* Expanded preset details - now directly below the preset */}
            {expandedPresetId === item.id && (
              <View style={styles.expandedCardInline}>
                <View style={styles.expandedHeaderRow}>
                  <TouchableOpacity style={styles.editBtnTopRight} onPress={() => openModal(item)}>
                    <Ionicons name="create-outline" size={22} color="#6b46c1" />
                  </TouchableOpacity>
                </View>
                <View style={styles.expandedRow}>
                  <Ionicons name="barbell-outline" size={20} color="#6b46c1" style={{ marginRight: 8 }} />
                  <Text style={styles.expandedSubtitle}>Exercises:</Text>
                </View>
                <View style={styles.exerciseList}>
                  {item.exercises.length === 0 ? (
                    <Text style={styles.emptyExerciseText}>No exercises yet.</Text>
                  ) : (
                    item.exercises.map((e, idx) => (
                      <View key={e.id || e.name + idx} style={styles.exerciseRowExpanded}>
                        <Ionicons name="ellipse" size={8} color="#6b46c1" style={{ marginRight: 8 }} />
                        <Text style={styles.exerciseNameExpanded}>{e.name}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No presets yet.</Text>}
      />
      {/* Move Create Button to Bottom */}
      <TouchableOpacity style={styles.createButton} onPress={() => openModal()}>
        <Ionicons name="add-circle-outline" size={28} color="#fff" />
        <Text style={styles.createButtonText}>Create Preset</Text>
      </TouchableOpacity>
      {/* Always show modal if modalVisible is true and AddExerciseScreen is NOT active (removes extra isFocused and pendingAddExercise checks) */}
      <Modal visible={modalVisible && !isAddExerciseScreenActive()} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalXBtn} onPress={() => { setModalVisible(false); navigation.navigate('Profile'); }}>
              <Ionicons name="close" size={28} color="#888" />
            </TouchableOpacity>
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
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
                      <Text style={{ fontSize: 15, color: "#ffffff" }}>{item.name}</Text>
                    </View>
                  )}
                  ListEmptyComponent={<Text style={{ color: "#666" }}>No exercises yet.</Text>}
                  nestedScrollEnabled={true}
                  scrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: 150 }}
                />
              </View>
              <TouchableOpacity style={styles.createButton} onPress={handleAddExerciseNav}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
                <Text style={styles.createButtonText}>Add Exercise</Text>
              </TouchableOpacity>
              <View style={styles.saveCancelRow}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Ionicons name="checkmark-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
                {editingPreset && (
                  <TouchableOpacity style={styles.deleteBtnPopup} onPress={() => { handleDelete(editingPreset.id); closeModal(); }}>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.deleteBtnPopupText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingHorizontal: 0, marginBottom: 16, flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingHorizontal: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#ffffff", letterSpacing: 1 },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171923', // Changed to solid dark color matching the app theme
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    marginHorizontal: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.3)',
  },
  presetCardActive: {
    // Keep the same dark background color, only change border
    borderColor: '#6b46c1',
    borderWidth: 2,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  presetName: { fontSize: 16, fontWeight: "bold", color: "#ffffff", marginBottom: 2 },
  presetExercises: { color: "rgba(255, 255, 255, 0.8)", fontSize: 13 },
  editBtn: { color: "#6b46c1", fontWeight: "bold", marginLeft: 10, fontSize: 15 },
  deleteBtn: { color: "#ef4444", fontWeight: "bold", marginLeft: 10, fontSize: 15 },
  empty: { color: "rgba(255, 255, 255, 0.5)", marginTop: 20, textAlign: "center" },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.7)", 
    justifyContent: "center", 
    alignItems: "center",
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalContent: { 
    backgroundColor: "#171923", 
    borderRadius: 14, 
    padding: 28, 
    width: "90%", 
    maxHeight: "90%", 
    elevation: 7, 
    borderWidth: 1.5, 
    borderColor: "#6b46c1",
    position: 'relative',
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#ffffff", alignSelf: "center", letterSpacing: 1 },
  input: { backgroundColor: "rgba(30, 32, 42, 0.9)", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 16, borderWidth: 1, borderColor: "rgba(107, 70, 193, 0.5)", color: "#ffffff" },
  expandedCard: {
    backgroundColor: '#171923', // Changed from semi-transparent to solid dark color
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#6b46c1',
    elevation: 7,
    minHeight: 100,
    flexGrow: 1,
  },
  expandedCardInline: {
    backgroundColor: '#171923', 
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginHorizontal: 12,
    marginTop: -10,
    marginBottom: 18,
    padding: 20,
    paddingTop: 10,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#6b46c1',
    elevation: 5,
    minHeight: 80,
  },
  expandedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  expandedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  editBtnTopRight: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 70, 193, 0.2)',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 193, 0.5)',
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  expandedSubtitle: {
    fontSize: 15,
    color: '#6b46c1',
    fontWeight: 'bold',
  },
  exerciseList: {
    marginBottom: 10,
    marginLeft: 4,
  },
  exerciseRowExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    marginLeft: 8,
  },
  exerciseNameExpanded: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyExerciseText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
    marginBottom: 6,
    marginLeft: 10,
  },
  saveCancelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6b46c1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    minWidth: 80,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f1fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  cancelBtnText: {
    color: '#6b46c1',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  deleteBtnPopup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginHorizontal: 0,
    minWidth: 80,
    justifyContent: 'center',
  },
  deleteBtnPopupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
  createButton: {
    backgroundColor: '#6b46c1',
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    flexDirection: 'row',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
    letterSpacing: 1,
  },
  closeModalXBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: 'transparent',
    padding: 6,
    borderRadius: 20,
  },
});

export default WorkoutPresets;
