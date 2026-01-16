import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Location, getLocArray, initializeLocData } from "../../components/LocalData";
import { useTheme } from "../../constants/ThemeContext";

export default function TabsLayout() {
  const { colors } = useTheme();

  // Load active locations from AsyncStorage.
  const [locations, setLocations] = useState<Location[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    async function loadLocations() {
      try {
        await initializeLocData();
        const locArray = await getLocArray();
        setLocations(locArray.filter(loc => loc.isActive));
        setReady(true);
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    }
    loadLocations();
  }, []);
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
        headerTitle: "Home",
        tabBarIcon: ({focused, color}) => (
            <Ionicons 
                name={focused ? "home-sharp" : "home-outline"}
                color={color}
                size={30} 
            />
        ),
      }} />
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
        tabBarIcon: ({focused, color}) => (
            <Ionicons 
                name={focused ? "settings-sharp" : "settings-outline"}
                color={color}
                size={30} 
            />
        ),
      }} />
    </Tabs>
  );
}
