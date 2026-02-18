export interface PPEItem {
  id: string;
  label: string;
  mandatory: boolean;
}

export const PPE_CHECKLIST_ITEMS: PPEItem[] = [
  { id: 'helmet', label: 'Safety helmet with headlamp', mandatory: true },
  { id: 'gas_detector', label: 'Personal gas detector', mandatory: true },
  { id: 'harness', label: 'Full-body safety harness + lifeline', mandatory: true },
  { id: 'gloves', label: 'Rubber gloves (elbow-length)', mandatory: true },
  { id: 'boots', label: 'Gumboots (anti-slip, steel-toe)', mandatory: true },
  { id: 'vest', label: 'Reflective safety vest', mandatory: true },
  { id: 'respirator', label: 'Face mask / respirator', mandatory: true },
  { id: 'firstaid', label: 'First-aid kit accessible', mandatory: true },
  { id: 'comms', label: 'Communication device charged', mandatory: true },
  { id: 'tripod', label: 'Tripod and winch at opening', mandatory: true },
  { id: 'ventilation', label: 'Ventilation fan running', mandatory: false },
  { id: 'supervisor', label: 'Supervisor present at site', mandatory: true },
];
