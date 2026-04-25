import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const canUseSecureStore = Platform.OS !== "web";

export const secureStorage = {
  async get(key: string): Promise<string | null> {
    try {
      if (canUseSecureStore) {
        return await SecureStore.getItemAsync(key);
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    try {
      if (canUseSecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch {
      // swallow — storage errors shouldn't crash the app
    }
  },
  async remove(key: string): Promise<void> {
    try {
      if (canUseSecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch {
      // swallow
    }
  }
};
