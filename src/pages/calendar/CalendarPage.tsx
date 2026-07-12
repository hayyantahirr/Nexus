import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BespokeCalendar } from '../../components/calendar/BespokeCalendar';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { 
  getAvailabilityForUser, 
  getMeetingsForUser, 
  addAvailabilitySlot, 
  removeAvailabilitySlot, 
  updateMeetingStatus 
} from '../../data/meetings';
import { findUserById } from '../../data/users';
import { AvailabilitySlot, Meeting } from '../../types';
import { Check, X, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  
  // Reload state triggers
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (user) {
      setSlots(getAvailabilityForUser(user.id));
      setMeetings(getMeetingsForUser(user.id));
    }
  }, [user, reloadKey]);

  if (!user) return null;

  const handleAddSlot = (date: string, start: string, end: string) => {
    addAvailabilitySlot(user.id, date, start, end);
    toast.success('Availability slot added!');
    setReloadKey(prev => prev + 1);
  };

  const handleRemoveSlot = (slotId: string) => {
    removeAvailabilitySlot(slotId);
    toast.success('Availability slot removed.');
    setReloadKey(prev => prev + 1);
  };

  const handleMeetingStatus = (meetingId: string, status: 'accepted' | 'declined') => {
    const updated = updateMeetingStatus(meetingId, status);
    if (updated) {
      toast.success(`Meeting request ${status}!`);
      setReloadKey(prev => prev + 1);
    }
  };

  // Get incoming requests
  const pendingRequests = meetings.filter(
    m => m.receiverId === user.id && m.status === 'pending'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
        <p className="text-gray-600">Set availability slots and manage scheduled appointments</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Calendar Board */}
        <div className="xl:col-span-3">
          <BespokeCalendar
            userId={user.id}
            slots={slots}
            meetings={meetings}
            isEditable={true}
            onAddSlot={handleAddSlot}
            onRemoveSlot={handleRemoveSlot}
          />
        </div>

        {/* Action Panel for Invitations */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-100 py-3.5 px-4 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                <AlertCircle size={16} className="mr-2 text-accent-500" />
                Meeting Requests ({pendingRequests.length})
              </h2>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No pending invitations.</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(req => {
                    const sender = findUserById(req.senderId);
                    return (
                      <div key={req.id} className="p-3 border border-gray-100 bg-white rounded-lg shadow-sm flex flex-col space-y-3">
                        <div className="flex items-center space-x-2.5">
                          <Avatar
                            src={sender?.avatarUrl || ''}
                            alt={sender?.name || ''}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-gray-900 truncate">
                              {sender?.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 capitalize">{sender?.role}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{req.title}</h4>
                          <div className="flex items-center text-[10px] text-gray-500 mt-1 space-x-2">
                            <span className="flex items-center"><CalendarIcon size={10} className="mr-0.5" /> {req.date}</span>
                            <span className="flex items-center"><Clock size={10} className="mr-0.5" /> {req.startTime}</span>
                          </div>
                          {req.description && (
                            <p className="text-[10px] text-gray-600 mt-1 line-clamp-2 bg-gray-50 p-1.5 rounded">{req.description}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="error"
                            size="xs"
                            onClick={() => handleMeetingStatus(req.id, 'declined')}
                            leftIcon={<X size={12} />}
                            className="text-[10px] py-1"
                          >
                            Decline
                          </Button>
                          <Button
                            variant="success"
                            size="xs"
                            onClick={() => handleMeetingStatus(req.id, 'accepted')}
                            leftIcon={<Check size={12} />}
                            className="text-[10px] py-1"
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
