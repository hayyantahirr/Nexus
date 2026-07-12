import { AvailabilitySlot, Meeting } from '../types';

// Helper to generate dynamic dates relative to current local time
const getRelativeDateString = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export const availabilitySlots: AvailabilitySlot[] = [
  // Slots for Sarah Johnson (Entrepreneur e1)
  {
    id: 'slot-e1-1',
    userId: 'e1',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '09:00',
    endTime: '10:00',
    isBooked: false
  },
  {
    id: 'slot-e1-2',
    userId: 'e1',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '11:00',
    endTime: '12:00',
    isBooked: false
  },
  {
    id: 'slot-e1-3',
    userId: 'e1',
    date: getRelativeDateString(2), // Day after tomorrow
    startTime: '14:00',
    endTime: '15:00',
    isBooked: true // Booked by Michael Rodriguez
  },
  {
    id: 'slot-e1-4',
    userId: 'e1',
    date: getRelativeDateString(3),
    startTime: '15:00',
    endTime: '16:00',
    isBooked: false
  },

  // Slots for Michael Rodriguez (Investor i1)
  {
    id: 'slot-i1-1',
    userId: 'i1',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '10:00',
    endTime: '11:00',
    isBooked: false
  },
  {
    id: 'slot-i1-2',
    userId: 'i1',
    date: getRelativeDateString(1), // Tomorrow
    startTime: '14:00',
    endTime: '15:00',
    isBooked: false
  },
  {
    id: 'slot-i1-3',
    userId: 'i1',
    date: getRelativeDateString(2), // Day after tomorrow
    startTime: '10:00',
    endTime: '11:00',
    isBooked: false
  },
  {
    id: 'slot-i1-4',
    userId: 'i1',
    date: getRelativeDateString(3),
    startTime: '11:00',
    endTime: '12:00',
    isBooked: false
  }
];

export const meetings: Meeting[] = [
  // Confirmed meeting between Sarah (e1) and Michael (i1)
  {
    id: 'meet-1',
    senderId: 'i1',
    receiverId: 'e1',
    title: 'TechWave AI Initial Pitch Review',
    description: 'Discuss financial analytics ML model details and Series A terms.',
    date: getRelativeDateString(2),
    startTime: '14:00',
    endTime: '15:00',
    status: 'accepted',
    createdAt: new Date().toISOString()
  },
  // Pending meeting request from Jennifer Lee (i2) to Sarah (e1)
  {
    id: 'meet-2',
    senderId: 'i2',
    receiverId: 'e1',
    title: 'Sustainability Integration Chat',
    description: 'Exploring how TechWave AI can incorporate green metric analysis.',
    date: getRelativeDateString(3),
    startTime: '10:00',
    endTime: '10:30',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

// CRUD & Query Helpers for Availability Slots

export const getAvailabilityForUser = (userId: string): AvailabilitySlot[] => {
  return availabilitySlots.filter(slot => slot.userId === userId);
};

export const addAvailabilitySlot = (
  userId: string,
  date: string,
  startTime: string,
  endTime: string
): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = {
    id: `slot-${userId}-${Date.now()}`,
    userId,
    date,
    startTime,
    endTime,
    isBooked: false
  };
  availabilitySlots.push(newSlot);
  return newSlot;
};

export const removeAvailabilitySlot = (slotId: string): boolean => {
  const idx = availabilitySlots.findIndex(slot => slot.id === slotId);
  if (idx === -1) return false;
  availabilitySlots.splice(idx, 1);
  return true;
};

// CRUD & Query Helpers for Meetings

export const getMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(meet => meet.senderId === userId || meet.receiverId === userId);
};

export const sendMeetingRequest = (
  senderId: string,
  receiverId: string,
  date: string,
  startTime: string,
  endTime: string,
  title: string,
  description: string,
  slotId?: string
): Meeting => {
  const newMeeting: Meeting = {
    id: `meet-${Date.now()}`,
    senderId,
    receiverId,
    title,
    description,
    date,
    startTime,
    endTime,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  meetings.push(newMeeting);

  // Mark the availability slot as booked if applicable
  if (slotId) {
    const slot = availabilitySlots.find(s => s.id === slotId);
    if (slot) {
      slot.isBooked = true;
    }
  }

  return newMeeting;
};

export const updateMeetingStatus = (
  meetingId: string,
  status: 'accepted' | 'declined'
): Meeting | null => {
  const meet = meetings.find(m => m.id === meetingId);
  if (!meet) return null;
  meet.status = status;
  return meet;
};
