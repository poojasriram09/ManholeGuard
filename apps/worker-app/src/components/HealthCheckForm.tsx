import { useState } from 'react';

interface HealthCheckFormProps {
  entryId: string;
  workerId: string;
  onSubmit: (data: HealthCheckData) => void;
}

interface HealthCheckData {
  entryId: string;
  workerId: string;
  feelingOk: boolean;
  symptoms: string[];
  notes: string;
  needsMedical: boolean;
}

const SYMPTOMS = [
  { id: 'headache', label: 'Headache' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'breathing_difficulty', label: 'Breathing difficulty' },
  { id: 'skin_irritation', label: 'Skin irritation' },
  { id: 'eye_irritation', label: 'Eye irritation' },
] as const;

export default function HealthCheckForm({ entryId, workerId, onSubmit }: HealthCheckFormProps) {
  const [feelingOk, setFeelingOk] = useState<boolean | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [needsMedical, setNeedsMedical] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const canSubmit = feelingOk !== null;

  const handleSubmit = () => {
    if (feelingOk === null) return;

    onSubmit({
      entryId,
      workerId,
      feelingOk,
      symptoms: feelingOk ? [] : selectedSymptoms,
      notes: notes.trim(),
      needsMedical,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">Post-Exit Health Check</h2>
        <p className="text-sm text-gray-500">
          Please report how you are feeling after this entry.
        </p>
      </div>

      {/* Feeling OK Toggle */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Are you feeling okay?
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setFeelingOk(true);
              setSelectedSymptoms([]);
              setNeedsMedical(false);
            }}
            className={`py-5 rounded-2xl text-lg font-bold transition-colors border-2 ${
              feelingOk === true
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-200 text-gray-700 active:bg-gray-50'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setFeelingOk(false)}
            className={`py-5 rounded-2xl text-lg font-bold transition-colors border-2 ${
              feelingOk === false
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-white border-gray-200 text-gray-700 active:bg-gray-50'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Symptoms Checkboxes -- shown when not feeling ok */}
      {feelingOk === false && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select any symptoms you are experiencing:
          </label>
          <div className="space-y-2">
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.id);
              return (
                <button
                  key={symptom.id}
                  type="button"
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors ${
                    isSelected
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-white active:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                      isSelected
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{symptom.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes Textarea */}
      <div>
        <label htmlFor="health-notes" className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          id="health-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe any other symptoms or concerns..."
          rows={3}
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-blue-400 transition-colors"
        />
      </div>

      {/* Needs Medical Attention */}
      {feelingOk === false && (
        <button
          type="button"
          onClick={() => setNeedsMedical((prev) => !prev)}
          className={`w-full flex items-center p-4 rounded-xl border-2 transition-colors ${
            needsMedical
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white active:bg-gray-50'
          }`}
        >
          <div
            className={`w-7 h-7 rounded border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
              needsMedical
                ? 'bg-red-500 border-red-500 text-white'
                : 'border-gray-300'
            }`}
          >
            {needsMedical && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className="text-left">
            <span className="text-sm font-semibold text-red-700">I need medical attention</span>
            <p className="text-xs text-red-500 mt-0.5">This will alert your supervisor immediately</p>
          </div>
        </button>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full rounded-2xl py-5 text-xl font-bold transition-colors ${
          canSubmit
            ? 'bg-blue-600 active:bg-blue-700 text-white shadow-lg'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Submit Health Check
      </button>
    </div>
  );
}
