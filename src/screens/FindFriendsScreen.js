import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../config/supabase";

const FindFriendsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState(new Set());

  // Get the current user from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  // Fetch users that are already being followed
  useEffect(() => {
    const fetchFollowedUsers = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching followed users:", error);
      } else {
        const followedIds = new Set(data.map((f) => f.friend_id));
        setFollowedUsers(followedIds);
      }
    };

    fetchFollowedUsers();
  }, [user]);

  // Debounced search effect
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, username")
        .ilike("username", `%${searchQuery}%`)
        .not("id", "eq", user.id); // Exclude current user

      if (error) {
        Alert.alert("Error", "Could not perform search.");
        console.error("Search error:", error);
      } else {
        setSearchResults(data);
      }
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user]);

  const handleFollowToggle = async (friendId, isCurrentlyFollowed) => {
    if (isCurrentlyFollowed) {
      // Unfollow logic
      const { error } = await supabase
        .from("friends")
        .delete()
        .eq("user_id", user.id)
        .eq("friend_id", friendId);

      if (error) {
        Alert.alert("Error", "Could not unfollow user.");
      } else {
        setFollowedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(friendId);
          return newSet;
        });
      }
    } else {
      // Follow logic
      const { error } = await supabase
        .from("friends")
        .insert({ user_id: user.id, friend_id: friendId });

      if (error) {
        Alert.alert("Error", "Could not follow user.");
      } else {
        setFollowedUsers((prev) => new Set(prev).add(friendId));
      }
    }
  };

  const renderUserItem = ({ item }) => {
    const isFollowed = followedUsers.has(item.id);
    return (
      <View style={styles.userItem}>
        <Text style={styles.username}>{item.username}</Text>
        <TouchableOpacity
          style={[styles.followButton, isFollowed && styles.unfollowButton]}
          onPress={() => handleFollowToggle(item.id, isFollowed)}
        >
          <Text style={styles.followButtonText}>
            {isFollowed ? "Unfollow" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for users..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 1
                  ? "No users found."
                  : "Search for friends by their username."}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23263a",
    paddingHorizontal: 15,
    margin: 15,
    borderRadius: 12
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#23263a",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  followButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8
  },
  unfollowButton: {
    backgroundColor: "#3a3d52"
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50
  },
  emptyText: {
    color: "gray",
    fontSize: 16
  }
});

export default FindFriendsScreen;
