export const FATIGUE_LIMITS = {
  MAX_ENTRIES_PER_SHIFT: 4,
  MAX_UNDERGROUND_MINUTES_PER_SHIFT: 120,
  MIN_REST_BETWEEN_ENTRIES_MINUTES: 15,
  MAX_SHIFT_HOURS: 10,
} as const;

export const HEALTH_SYMPTOMS = [
  { id: 'dizziness', label: 'Dizziness / lightheadedness', serious: true },
  { id: 'nausea', label: 'Nausea / vomiting', serious: true },
  { id: 'breathlessness', label: 'Difficulty breathing', serious: true },
  { id: 'skin_irritation', label: 'Skin irritation / rash', serious: false },
  { id: 'eye_irritation', label: 'Eye irritation / burning', serious: false },
  { id: 'headache', label: 'Headache', serious: false },
  { id: 'chest_pain', label: 'Chest pain / tightness', serious: true },
  { id: 'unconscious', label: 'Loss of consciousness', serious: true },
  { id: 'none', label: 'None — I feel fine', serious: false },
] as const;

export const REQUIRED_CERTIFICATIONS = [
  'SAFETY_TRAINING',
  'CONFINED_SPACE',
  'MEDICAL_FITNESS',
] as const;
