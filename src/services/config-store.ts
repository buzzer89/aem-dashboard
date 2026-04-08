import type { AEMConfig } from "@/types/config";

const STORAGE_KEY = "aem-dashboard-config";

export function saveConfig(config: AEMConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadConfig(): AEMConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AEMConfig;
  } catch {
    return null;
  }
}

export function clearConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasConfig(): boolean {
  return loadConfig() !== null;
}
