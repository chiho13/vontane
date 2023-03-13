import { Voice } from "../types/voice";
import { getUniqueValues } from "./util";

export async function fetchVoices(): Promise<Voice[]> {
  const response = await fetch("https://verbyttsapi.vercel.app/voices");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.voices;
}

export function getAccents(voices: Voice[]): { key: string; value: string }[] {
  return getUniqueValues(voices, "accent");
}

export function getAges(voices: Voice[]): { key: string; value: string }[] {
  return getUniqueValues(voices, "age");
}

export function getVoiceStyles(
  voices: Voice[]
): { key: string; value: string }[] {
  return getUniqueValues(voices, "style");
}

export function getTempos(voices: Voice[]): { key: string; value: string }[] {
  return getUniqueValues(voices, "tempo");
}
