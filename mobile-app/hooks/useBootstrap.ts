import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthApi, hydrateTokensFromStorage } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { LOCALE_STORAGE_KEY, setLocale } from "@/i18n";

export function useBootstrap(): void {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("booting");
      await hydrateTokensFromStorage();
      try {
        const { user } = await AuthApi.fetchMe();
        if (cancelled) return;
        setUser(user);
        const pref = user?.preferredLanguage;
        if (pref === "de" || pref === "en") {
          try {
            const storedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
            if (!storedLocale) await setLocale(pref);
          } catch {
            /* noop */
          }
        }
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setStatus, setUser]);
}
