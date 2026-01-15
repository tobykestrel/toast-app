import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { clearAllData, initializeStuData, initializeLocData, initializeTeaData, initializeStnData } from "../components/LocalData";
import { useEffect, useState } from "react";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Clear all data on app startup for development
        await clearAllData();
        // Reinitialize all data from local JSON
        await initializeLocData();
        await initializeStuData();
        await initializeTeaData();
        await initializeStnData();
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsReady(true);
      }
    }
    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark"/>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
