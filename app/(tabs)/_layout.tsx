import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Tabs } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Location,
    getLocArray,
    initializeLocData,
} from "../../components/LocalData";
import { useTheme } from "../../constants/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Load active locations from AsyncStorage.
  const [locations, setLocations] = useState<Location[]>([]);
  const [siteName, setSiteName] = useState("Home");
  const [ready, setReady] = useState(false);

  const loadSiteName = useCallback(async () => {
    try {
      const settingsJson = await AsyncStorage.getItem("settings");
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        setSiteName(settings.siteName || "Home");
      } else {
        setSiteName("Home");
      }
    } catch (err) {
      console.error("Failed to load siteName:", err);
    }
  }, []);

  // Listen for any navigation state change to reload siteName
  useEffect(() => {
    const unsubscribe = navigation.addListener("state", () => {
      loadSiteName();
    });

    return unsubscribe;
  }, [navigation, loadSiteName]);

  useEffect(() => {
    async function loadLocations() {
      try {
        // Load siteName from settings
        await loadSiteName();

        await initializeLocData();
        const locArray = await getLocArray();
        setLocations(locArray.filter((loc) => loc.isActive));
        setReady(true);
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    }
    loadLocations();
  }, [loadSiteName]);
  if (!ready) return null; // TODO: Add splash screen.

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.blue,
        headerStyle: { backgroundColor: colors.container },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.container },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: siteName || "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={30}
            />
          ),
        }}
      />
      {locations.map((loc) => (
        <Tabs.Screen
          key={loc.id}
          name={loc.id}
          options={{
            title: loc.locationName,
            headerTitle: loc.locationName,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? "clipboard-sharp" : "clipboard-outline"}
                color={color}
                size={30}
              />
            ),
          }}
        />
      ))}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "settings-sharp" : "settings-outline"}
              color={color}
              size={30}
            />
          ),
        }}
      />
    </Tabs>
  );
}
