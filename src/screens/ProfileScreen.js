import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import LoginRequiredModal from "../components/LoginRequiredModal";
import { getCurrentUser, logoutUser } from "../services/supabaseAuth";
import {
  getUserStats,
  getUserWorkoutHistory
} from "../services/supabaseWorkouts";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        setShowLoginModal(true);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setShowLoginModal(false);

      // Load user stats
      const stats = await getUserStats(currentUser.id);
      setUserStats(stats);

      // Load recent workouts
      const workouts = await getUserWorkoutHistory(currentUser.id, 10);
      setRecentWorkouts(workouts);
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser();
            setUser(null);
            setUserStats(null);
            setRecentWorkouts([]);
            navigation.navigate("Login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout");
          }
        }
      }
    ]);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    loadUserData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <LoginRequiredModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
          navigation={navigation}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#4CAF50" />
        </View>
        <Text style={styles.userName}>
          {user.user_metadata?.first_name && user.user_metadata?.last_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
            : user.email}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.memberSince}>
          Member since {formatDate(user.created_at)}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.total_workouts || 0}
            </Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.current_streak || 0}
            </Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.total_volume ? Math.round(userStats.total_volume) : 0}
            </Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {userStats?.total_duration_minutes
                ? formatDuration(userStats.total_duration_minutes)
                : "0m"}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.workoutsSection}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.length > 0 ? (
          recentWorkouts.map((workout, index) => (
            <View key={workout.id || index} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDate}>
                  {formatDate(workout.created_at)}
                </Text>
              </View>
              <View style={styles.workoutDetails}>
                <Text style={styles.workoutDetail}>
                  <Ionicons name="fitness" size={14} color="#4CAF50" />{" "}
                  {workout.exercises?.length || 0} exercises
                </Text>
                {workout.duration_minutes && (
                  <Text style={styles.workoutDetail}>
                    <Ionicons name="time" size={14} color="#4CAF50" />{" "}
                    {formatDuration(workout.duration_minutes)}
                  </Text>
                )}
                {workout.total_volume && (
                  <Text style={styles.workoutDetail}>
                    <Ionicons name="barbell" size={14} color="#4CAF50" />{" "}
                    {Math.round(workout.total_volume)} kg
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noWorkoutsContainer}>
            <Ionicons name="fitness-outline" size={48} color="#888" />
            <Text style={styles.noWorkoutsText}>No workouts yet</Text>
            <Text style={styles.noWorkoutsSubtext}>
              Start your first workout to see your history here
            </Text>
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("About")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.settingText}>About TFC</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate("RecoveryGuide")}
        >
          <Ionicons name="heart-outline" size={24} color="#4CAF50" />
          <Text style={styles.settingText}>Recovery Guide</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1c2e"
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16
  },
  profileHeader: {
    alignItems: "center",
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#23263a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5
  },
  userEmail: {
    fontSize: 16,
    color: "#888",
    marginBottom: 5
  },
  memberSince: {
    fontSize: 14,
    color: "#666"
  },
  statsSection: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  statCard: {
    backgroundColor: "#23263a",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "48%",
    marginBottom: 10
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    textAlign: "center"
  },
  workoutsSection: {
    padding: 20,
    paddingTop: 0
  },
  workoutCard: {
    backgroundColor: "#23263a",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1
  },
  workoutDate: {
    fontSize: 14,
    color: "#888"
  },
  workoutDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15
  },
  workoutDetail: {
    fontSize: 14,
    color: "#fff",
    alignItems: "center"
  },
  noWorkoutsContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#23263a",
    borderRadius: 12
  },
  noWorkoutsText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 15,
    marginBottom: 5
  },
  noWorkoutsSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center"
  },
  settingsSection: {
    padding: 20,
    paddingTop: 0
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23263a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  settingText: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
    marginLeft: 15
  },
  logoutItem: {
    marginTop: 10
  },
  logoutText: {
    color: "#f44336"
  }
});

export default ProfileScreen;
