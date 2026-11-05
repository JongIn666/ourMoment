import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type GroupView = "timeline" | "calendar";

function storageKey(userId: number, groupId: number) {
  return `ourmoment.groupView.${userId}.${groupId}`;
}

export async function getStoredGroupView(userId: number, groupId: number): Promise<GroupView> {
  const key = storageKey(userId, groupId);
  const view = Platform.OS === "web"
    ? window.localStorage.getItem(key)
    : await SecureStore.getItemAsync(key);
  return view === "calendar" ? "calendar" : "timeline";
}

export async function setStoredGroupView(userId: number, groupId: number, view: GroupView) {
  const key = storageKey(userId, groupId);
  if (Platform.OS === "web") {
    window.localStorage.setItem(key, view);
    return;
  }
  await SecureStore.setItemAsync(key, view);
}
