import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Bell, Calendar,  AlertCircle, PlusCircle, Clock, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { CollaborationRequestCard } from '../../components/collaboration/CollaborationRequestCard';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { useAuth } from '../../context/AuthContext';
import { CollaborationRequest, Meeting } from '../../types';
import { getRequestsForEntrepreneur } from '../../data/collaborationRequests';
import { getMeetingsForUser } from '../../data/meetings';
import { investors, findUserById } from '../../data/users';
import { getWalletBalance } from '../../data/wallet';

export const EntrepreneurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [recommendedInvestors, setRecommendedInvestors] = useState(investors.slice(0, 3));
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  
  useEffect(() => {
    if (user) {
      // Load collaboration requests
      const requests = getRequestsForEntrepreneur(user.id);
      setCollaborationRequests(requests);
      
      // Load balance
      setWalletBalance(getWalletBalance(user.id));

      // Load meetings
      const userMeetings = getMeetingsForUser(user.id);
      setMeetings(userMeetings);
    }
  }, [user]);
  
  const handleRequestStatusUpdate = (requestId: string, status: 'accepted' | 'rejected') => {
    setCollaborationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === requestId ? { ...req, status } : req
      )
    );
  };
  
  if (!user) return null;
  
  const pendingRequests = collaborationRequests.filter(req => req.status === 'pending');
  const confirmedMeetings = meetings.filter(m => m.status === 'accepted');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">Here's what's happening with your startup today</p>
        </div>
        
        <Link to="/investors">
          <Button
            leftIcon={<PlusCircle size={18} />}
            className="interactive-button"
          >
            Find Investors
          </Button>
        </Link>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Bell size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Pending Requests</p>
                <h3 className="text-xl font-semibold text-primary-900">{pendingRequests.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <Users size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">Total Connections</p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {collaborationRequests.filter(req => req.status === 'accepted').length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Calendar size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">Upcoming Meetings</p>
                <h3 className="text-xl font-semibold text-accent-900">{confirmedMeetings.length}</h3>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Link to="/wallet">
          <Card className="bg-success-50 border border-success-100 hover:bg-success-100/50 cursor-pointer transition-all">
            <CardBody>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Wallet size={20} className="text-success-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success-700">Wallet Balance</p>
                  <h3 className="text-xl font-semibold text-success-900 font-mono">
                    ${walletBalance.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collaboration requests */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Collaboration Requests</h2>
              <Badge variant="primary">{pendingRequests.length} pending</Badge>
            </CardHeader>
            
            <CardBody>
              {collaborationRequests.length > 0 ? (
                <div className="space-y-4">
                  {collaborationRequests.map(request => (
                    <CollaborationRequestCard
                       key={request.id}
                       request={request}
                       onStatusUpdate={handleRequestStatusUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <AlertCircle size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-600">No collaboration requests yet</p>
                  <p className="text-sm text-gray-500 mt-1">When investors are interested in your startup, their requests will appear here</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        {/* Recommended investors & Upcoming Meetings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recommended Investors</h2>
              <Link to="/investors" className="text-sm font-medium text-primary-600 hover:text-primary-500 interactive-link">
                View all
              </Link>
            </CardHeader>
            
            <CardBody className="space-y-4">
              {recommendedInvestors.map(investor => (
                <InvestorCard
                  key={investor.id}
                  investor={investor}
                  showActions={false}
                />
              ))}
            </CardBody>
          </Card>

          {/* Upcoming Meetings widget */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Meetings</h2>
              <Link to="/calendar" className="text-sm font-medium text-primary-600 hover:text-primary-500 interactive-link">
                View Calendar
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {confirmedMeetings.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">No upcoming meetings.</p>
              ) : (
                confirmedMeetings.map(meet => {
                  const partnerId = meet.senderId === user.id ? meet.receiverId : meet.senderId;
                  const partner = findUserById(partnerId);
                  return (
                    <div key={meet.id} className="p-3 border border-gray-100 bg-white rounded-lg shadow-sm text-sm">
                      <div className="flex justify-between items-start font-medium">
                        <span className="truncate pr-1 text-gray-900">{meet.title}</span>
                        <span className="text-[10px] whitespace-nowrap bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded flex items-center">
                          <Clock size={10} className="mr-1" />
                          {meet.startTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-2 text-xs text-gray-500">
                        <Avatar src={partner?.avatarUrl || ''} alt={partner?.name || ''} size="xs" />
                        <span>With {partner?.name}</span>
                        <span className="text-gray-300">|</span>
                        <span>{meet.date}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};