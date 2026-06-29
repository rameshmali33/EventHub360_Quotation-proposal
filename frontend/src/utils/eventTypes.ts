export type EventTypeStatus = 'Active' | 'Inactive';

export type EventTypeMasterItem = {
  id: string;
  name: string;
  description: string;
  status: EventTypeStatus;
};

export const EVENT_TYPES_KEY = 'eventhub_event_types_master';
export const EVENT_TYPES_CHANGED_EVENT = 'event-types-master-updated';

export const defaultEventTypes: EventTypeMasterItem[] = [
  { id: 'event-wedding', name: 'Wedding', description: 'Wedding, reception, and related private functions.', status: 'Active' },
  { id: 'event-corporate', name: 'Corporate Gala', description: 'Corporate dinners, launches, galas, and celebrations.', status: 'Active' },
  { id: 'event-conference', name: 'Conference', description: 'Business conferences, seminars, and summits.', status: 'Active' },
  { id: 'event-birthday', name: 'Private Birthday Party', description: 'Private birthday parties and family celebrations.', status: 'Active' },
];

const parseEventTypes = (raw: string | null) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as EventTypeMasterItem[] : null;
  } catch {
    return null;
  }
};

export const getEventTypes = () => {
  const saved = parseEventTypes(localStorage.getItem(EVENT_TYPES_KEY));
  if (saved) return saved;
  localStorage.setItem(EVENT_TYPES_KEY, JSON.stringify(defaultEventTypes));
  return defaultEventTypes;
};

export const saveEventTypes = (items: EventTypeMasterItem[]) => {
  localStorage.setItem(EVENT_TYPES_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_TYPES_CHANGED_EVENT));
};

export const getActiveEventTypes = () => getEventTypes().filter((item) => item.status === 'Active');
