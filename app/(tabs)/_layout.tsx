import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Location, initializeLocData, getLocArray } from "../../components/LocalData";

export default function TabsLayout() {

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
            tabBarActiveTintColor: "#82baff",
            headerStyle: { backgroundColor: "#25292e" },
            headerShadowVisible: false,
            headerTintColor: "#fff",
            tabBarStyle: { backgroundColor: "#25292e" },
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
          initialParams={{ locID: loc.id }} 
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
