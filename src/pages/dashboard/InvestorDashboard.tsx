import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  PieChart,
  Filter,
  Search,
  PlusCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { EntrepreneurCard } from "../../components/entrepreneur/EntrepreneurCard";
import { useAuth } from "../../context/AuthContext";
import { Entrepreneur, Meeting } from "../../types";
import { entrepreneurs, findUserById } from "../../data/users";
import { getRequestsFromInvestor } from "../../data/collaborationRequests";
import { getMeetingsForUser } from "../../data/meetings";

export const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (user) {
      const userMeetings = getMeetingsForUser(user.id);
      setMeetings(userMeetings);
    }
  }, [user]);

  if (!user) return null;

  // Get collaboration requests sent by this investor
  const sentRequests = getRequestsFromInvestor(user.id);

  // Filter entrepreneurs based on search and industry filters
  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Industry filter
    const matchesIndustry =
      selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);

    return matchesSearch && matchesIndustry;
  });

  // Get unique industries for filter
  const industries = Array.from(new Set(entrepreneurs.map((e) => e.industry)));

  // Toggle industry selection
  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prevSelected) =>
      prevSelected.includes(industry)
        ? prevSelected.filter((i) => i !== industry)
        : [...prevSelected, industry],
    );
  };

  const confirmedMeetings = meetings.filter((m) => m.status === "accepted");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Discover Startups
          </h1>
          <p className="text-gray-600">
            Find and connect with promising entrepreneurs
          </p>
        </div>

        <Link to="/entrepreneurs">
          <Button
            leftIcon={<PlusCircle size={18} />}
            className="interactive-button"
          >
            View All Startups
          </Button>
        </Link>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search startups, industries, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            startAdornment={<Search size={18} />}
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>

            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge
                  key={industry}
                  variant={
                    selectedIndustries.includes(industry) ? "primary" : "gray"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full mr-4">
                <Users size={20} className="text-primary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">
                  Total Startups
                </p>
                <h3 className="text-xl font-semibold text-primary-900">
                  {entrepreneurs.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-full mr-4">
                <PieChart size={20} className="text-secondary-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-700">
                  Industries
                </p>
                <h3 className="text-xl font-semibold text-secondary-900">
                  {industries.length}
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-full mr-4">
                <Users size={20} className="text-accent-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-700">
                  Your Connections
                </p>
                <h3 className="text-xl font-semibold text-accent-900">
                  {
                    sentRequests.filter((req) => req.status === "accepted")
                      .length
                  }
                </h3>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Two-column main contents grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entrepreneurs grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Featured Startups
              </h2>
            </CardHeader>

            <CardBody>
              {filteredEntrepreneurs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEntrepreneurs.map((entrepreneur) => (
                    <EntrepreneurCard
                      key={entrepreneur.id}
                      entrepreneur={entrepreneur}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No startups match your filters
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 interactive-button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedIndustries([]);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-6">
          {/* Upcoming Meetings widget */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Upcoming Meetings
              </h2>
              <Link
                to="/calendar"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 interactive-link"
              >
                View Calendar
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {confirmedMeetings.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  No upcoming meetings.
                </p>
              ) : (
                confirmedMeetings.map((meet) => {
                  const partnerId =
                    meet.senderId === user.id ? meet.receiverId : meet.senderId;
                  const partner = findUserById(partnerId);
                  return (
                    <div
                      key={meet.id}
                      className="p-3 border border-gray-100 bg-white rounded-lg shadow-sm text-sm"
                    >
                      <div className="flex justify-between items-start font-medium">
                        <span className="truncate pr-1 text-gray-900">
                          {meet.title}
                        </span>
                        <span className="text-[10px] whitespace-nowrap bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded flex items-center">
                          <Clock size={10} className="mr-1" />
                          {meet.startTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-2 text-xs text-gray-500">
                        <Avatar
                          src={partner?.avatarUrl || ""}
                          alt={partner?.name || ""}
                          size="xs"
                        />
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
