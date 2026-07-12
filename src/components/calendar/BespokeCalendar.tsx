import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { Input } from '../ui/Input';
import { AvailabilitySlot, Meeting } from '../../types';

interface BespokeCalendarProps {
  userId: string; // The user whose calendar we are viewing
  slots: AvailabilitySlot[];
  meetings: Meeting[];
  isEditable?: boolean; // If true, allows adding/removing availability slots
  onAddSlot?: (date: string, startTime: string, endTime: string) => void;
  onRemoveSlot?: (slotId: string) => void;
  onSelectSlot?: (slot: AvailabilitySlot) => void; // Called when booking a slot
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const BespokeCalendar: React.FC<BespokeCalendarProps> = ({
  userId,
  slots,
  meetings,
  isEditable = false,
  onAddSlot,
  onRemoveSlot,
  onSelectSlot
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // State for Add Slot Form
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(year, month);
  const startDayOfWeek = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to format date key: YYYY-MM-DD
  const formatDateKey = (dayNum: number): string => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Filter slots & meetings for selected date
  const selectedDateSlots = slots.filter(s => s.date === selectedDateStr);
  const selectedDateMeetings = meetings.filter(m => m.date === selectedDateStr);

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddSlot) {
      onAddSlot(selectedDateStr, startTime, endTime);
    }
  };

  // Render Calendar Grid Days
  const calendarCells = [];
  
  // Empty slots for offset padding before day 1
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-12 border border-gray-100 bg-gray-50/50"></div>);
  }

  // Actual days
  for (let d = 1; d <= totalDays; d++) {
    const dateKey = formatDateKey(d);
    const isSelected = selectedDateStr === dateKey;
    
    // Check data indicators
    const daySlots = slots.filter(s => s.date === dateKey);
    const dayMeetings = meetings.filter(m => m.date === dateKey);
    
    const hasAvailable = daySlots.some(s => !s.isBooked);
    const hasConfirmed = dayMeetings.some(m => m.status === 'accepted');
    const hasPending = dayMeetings.some(m => m.status === 'pending');

    calendarCells.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => setSelectedDateStr(dateKey)}
        className={`h-12 border border-gray-100 flex flex-col justify-between p-1 transition-all relative ${
          isSelected 
            ? 'bg-primary-50 border-primary-500 font-semibold text-primary-900 z-10 ring-1 ring-primary-500' 
            : 'hover:bg-gray-50 text-gray-800'
        }`}
      >
        <span className="text-xs">{d}</span>
        
        {/* Indicators dot bar */}
        <div className="flex space-x-1 justify-center w-full pb-0.5">
          {hasAvailable && (
            <span className="w-1.5 h-1.5 bg-secondary-500 rounded-full" title="Available slots"></span>
          )}
          {hasConfirmed && (
            <span className="w-1.5 h-1.5 bg-primary-600 rounded-full" title="Confirmed meetings"></span>
          )}
          {hasPending && (
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full" title="Pending meeting requests"></span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly grid */}
      <Card className="lg:col-span-2 shadow-sm border border-gray-200">
        <CardBody className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900">
              {MONTHS[month]} {year}
            </h3>
            <div className="flex space-x-1">
              <Button variant="ghost" size="xs" onClick={prevMonth} aria-label="Previous month" className="p-1 rounded-full">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="ghost" size="xs" onClick={nextMonth} aria-label="Next month" className="p-1 rounded-full">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>

          {/* Days of week titles */}
          <div className="grid grid-cols-7 text-center font-medium text-xs text-gray-500 mb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Monthly dates grid */}
          <div className="grid grid-cols-7 border-t border-l border-gray-100 rounded overflow-hidden">
            {calendarCells}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 justify-center">
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 bg-secondary-500 rounded-full mr-1.5"></span>
              <span>Available Slot</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 bg-primary-600 rounded-full mr-1.5"></span>
              <span>Confirmed Meeting</span>
            </div>
            <div className="flex items-center">
              <span className="w-2.5 h-2.5 bg-accent-500 rounded-full mr-1.5"></span>
              <span>Pending Request</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Date details & actions */}
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-4 flex flex-col h-full space-y-4">
          <div>
            <h3 className="text-md font-semibold text-gray-900 flex items-center">
              <CalendarIcon size={18} className="mr-2 text-primary-600" />
              {selectedDateStr}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Schedule details for this date</p>
          </div>

          <hr className="border-gray-100" />

          {/* Confirmed / Pending Meetings List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Meetings
            </h4>
            
            {selectedDateMeetings.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No meetings scheduled.</p>
            ) : (
              <div className="space-y-2">
                {selectedDateMeetings.map(meet => (
                  <div key={meet.id} className={`p-2.5 rounded border text-sm ${
                    meet.status === 'accepted' 
                      ? 'border-primary-200 bg-primary-50 text-primary-900' 
                      : 'border-accent-200 bg-accent-50 text-accent-900'
                  }`}>
                    <div className="flex justify-between items-start font-medium">
                      <span className="truncate pr-1">{meet.title}</span>
                      <span className="text-xs whitespace-nowrap bg-white/60 px-1.5 py-0.5 rounded flex items-center">
                        <Clock size={12} className="mr-1" />
                        {meet.startTime}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{meet.description}</p>
                    <span className={`text-[10px] mt-1.5 inline-block font-semibold uppercase px-1 rounded ${
                      meet.status === 'accepted' ? 'text-primary-700 bg-primary-100' : 'text-accent-700 bg-accent-100'
                    }`}>
                      {meet.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slots View / Manage */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Availability Slots
            </h4>

            {selectedDateSlots.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No slots defined.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedDateSlots.map(slot => (
                  <div 
                    key={slot.id} 
                    className={`flex items-center justify-between p-2 rounded border text-xs ${
                      slot.isBooked 
                        ? 'border-gray-200 bg-gray-50 text-gray-400' 
                        : 'border-secondary-200 bg-secondary-50 text-secondary-900'
                    }`}
                  >
                    <span className="flex items-center font-medium">
                      <Clock size={14} className="mr-1.5" />
                      {slot.startTime} - {slot.endTime}
                    </span>

                    {/* Action buttons depending on view role */}
                    {isEditable ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onRemoveSlot && onRemoveSlot(slot.id)}
                        className="p-1 hover:text-error-600 rounded text-gray-500"
                        aria-label="Remove slot"
                      >
                        <Trash2 size={14} />
                      </Button>
                    ) : (
                      !slot.isBooked && onSelectSlot && (
                        <Button 
                          variant="secondary"
                          size="xs"
                          onClick={() => onSelectSlot(slot)}
                          className="px-2 py-0.5 rounded text-[10px]"
                        >
                          Book Slot
                        </Button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Availability slot form (For Current User Dashboard Calendar) */}
          {isEditable && onAddSlot && (
            <form onSubmit={handleAddSlotSubmit} className="pt-4 border-t border-gray-100 space-y-3 mt-auto">
              <h4 className="text-xs font-semibold text-gray-900">Add Availability Slot</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />
                <Input
                  label="End Time"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" size="sm" fullWidth leftIcon={<Plus size={14} />}>
                Add Available Slot
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
