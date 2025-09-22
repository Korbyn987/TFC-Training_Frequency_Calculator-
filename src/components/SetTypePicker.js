import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const setTypes = ["working", "warm-up", "failure", "drop"];

const SetTypePicker = ({ selectedValue, onValueChange }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>
          {selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#ccc" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContent}>
            {setTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.optionButton}
                onPress={() => handleSelect(type)}
              >
                <Text style={styles.optionText}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                {selectedValue === type && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1c2e",
    borderRadius: 6,
    padding: 10,
    height: 44 // Match TextInput height
  },
  pickerButtonText: {
    color: "#fff",
    fontSize: 16,
    textTransform: "capitalize"
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)"
  },
  modalContent: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 10,
    width: "80%",
    maxHeight: "50%"
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#3a3d52"
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    textTransform: "capitalize"
  }
});

export default SetTypePicker;
