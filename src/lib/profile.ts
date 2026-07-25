export type Profile = {
  name: string;
  age: string;
  language: string;
  education: string;
  referral: string;
  completedAt: string;
};

const KEY = "studymate-profile";

export function readProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

export function clearProfile() {
  try { localStorage.removeItem(KEY); } catch {}
}

export const LANGUAGES = [
  "English", "Urdu", "Hindi", "Arabic", "French",
  "Spanish", "German", "Chinese", "Japanese", "Korean",
];

export const EDUCATION_LEVELS = ["School", "College", "University", "Other"];

export const REFERRALS = [
  "Friend", "Teacher", "Social Media", "Google Search", "YouTube", "University", "Other",
];