import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ArrowLeft,
  Upload,
  PenTool,
  CheckCircle2,
  Lock,
  FileText,
  X,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Types
interface DealDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  status: "Draft" | "In Review" | "Signed";
  signedBy?: string;
  signedDate?: string;
  signatureDataUrl?: string;
  contentMock: string[];
}

interface Deal {
  id: number;
  amount: string;
  equity: string;
  status: string;
  stage: string;
  lastActivity: string;
  startup: {
    name: string;
    logo: string;
    industry: string;
  };
  documents: DealDocument[];
}

const initialDeals: Deal[] = [
  {
    id: 1,
    amount: "$1.5M",
    equity: "15%",
    status: "Due Diligence",
    stage: "Series A",
    lastActivity: "2026-02-15",
    startup: {
      name: "TechWave AI",
      logo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      industry: "FinTech",
    },
    documents: [
      {
        id: "doc-1-1",
        name: "TechWave_AI_Term_Sheet.pdf",
        type: "PDF",
        size: "2.4 MB",
        lastModified: "2026-02-15",
        status: "In Review",
        contentMock: [
          "TERM SHEET FOR SERIES A PREFERRED STOCK financing of TechWave AI, Inc.",
          "ISSUER: TechWave AI, Inc., a Delaware corporation.",
          "INVESTOR: Business Nexus Ventures Syndicate.",
          "AMOUNT OF INVESTMENT: $1,500,000 USD.",
          "PRE-MONEY VALUATION: $10,000,000 USD.",
          "EQUITY PERCENTAGE: 15.00% post-money.",
          "BOARD REPRESENTATION: Investors shall elect one (1) member of the Board of Directors.",
        ],
      },
      {
        id: "doc-1-2",
        name: "Series_A_Shareholder_Agreement.pdf",
        type: "PDF",
        size: "3.2 MB",
        lastModified: "2026-02-10",
        status: "Draft",
        contentMock: [
          "AMENDED AND RESTATED SHAREHOLDERS AGREEMENT",
          "THIS AGREEMENT is made and entered into on this 10th day of February 2026.",
          "BY AND AMONG: TechWave AI, Inc. and its designated founders and Series A Investors.",
          "RESTRICTIONS ON TRANSFER: Shareholders shall not sell or assign shares without First Refusal rights.",
          "DRAG-ALONG RIGHTS: 51% vote of Preferred Stock is required to drag-along remaining shareholders.",
        ],
      },
      {
        id: "doc-1-3",
        name: "Mutual_NDA_TechWave.pdf",
        type: "PDF",
        size: "1.2 MB",
        lastModified: "2026-02-05",
        status: "Signed",
        signedBy: "Michael Rodriguez",
        signedDate: "2026-02-05",
        signatureDataUrl:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10,25 Q30,10 50,30 T90,20" fill="none" stroke="%230284c7" stroke-width="2"/></svg>',
        contentMock: [
          "MUTUAL NON-DISCLOSURE AGREEMENT (NDA)",
          "PURPOSE: To explore potential investment, business partnership, and funding options.",
          "CONFIDENTIALITY PERIOD: Receiving party shall protect information for five (5) years.",
          "NO INTELLECTUAL PROPERTY RIGHTS: Nothing grants rights to patents, code, or trademarks.",
          "STATUS: FULLY EXECUTED & STAMPED BY DIGITAL REGISTRY.",
        ],
      },
    ],
  },
  {
    id: 2,
    amount: "$2M",
    equity: "20%",
    status: "Term Sheet",
    stage: "Seed",
    lastActivity: "2026-02-10",
    startup: {
      name: "GreenLife Solutions",
      logo: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
      industry: "CleanTech",
    },
    documents: [
      {
        id: "doc-2-1",
        name: "GreenLife_Seed_TermSheet.pdf",
        type: "PDF",
        size: "1.9 MB",
        lastModified: "2026-02-10",
        status: "In Review",
        contentMock: [
          "TERM SHEET FOR SEED ROUND FUNDING OF GREENLIFE SOLUTIONS",
          "ISSUER: GreenLife Solutions, Inc.",
          "ROUND SIZE: $2,000,000 USD.",
          "EQUITY ISSUED: 20.00% Seed Preferred Stock.",
          "LIQUIDATION PREFERENCE: 1x non-participating preferred shares.",
        ],
      },
    ],
  },
  {
    id: 3,
    amount: "$800K",
    equity: "12%",
    status: "Negotiation",
    stage: "Pre-seed",
    lastActivity: "2026-02-05",
    startup: {
      name: "HealthPulse",
      logo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      industry: "HealthTech",
    },
    documents: [],
  },
];

export const DealsPage: React.FC = () => {
  const { user } = useAuth();

  // Deals State
  const [dealsList, setDealsList] = useState<Deal[]>(initialDeals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  // Navigation Sub-view State
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DealDocument | null>(null);

  // Signature States
  const [isSigning, setIsSigning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mock File Upload Ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const statuses = [
    "Due Diligence",
    "Term Sheet",
    "Negotiation",
    "Closed",
    "Passed",
  ];

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Due Diligence":
        return "primary";
      case "Term Sheet":
        return "secondary";
      case "Negotiation":
        return "accent";
      case "Closed":
        return "success";
      case "Passed":
        return "error";
      default:
        return "gray";
    }
  };

  const getDocStatusBadge = (status: DealDocument["status"]) => {
    switch (status) {
      case "Draft":
        return <Badge variant="gray">Draft</Badge>;
      case "In Review":
        return <Badge variant="primary">In Review</Badge>;
      case "Signed":
        return <Badge variant="success">Signed</Badge>;
    }
  };

  // Sync selectedDoc state with changes in dealsList
  useEffect(() => {
    if (selectedDeal && selectedDoc) {
      const currentDeal = dealsList.find((d) => d.id === selectedDeal.id);
      const currentDoc = currentDeal?.documents.find(
        (doc) => doc.id === selectedDoc.id,
      );
      if (currentDoc) {
        setSelectedDoc(currentDoc);
      }
    }
  }, [dealsList, selectedDeal, selectedDoc]);

  // Canvas drawing events (Mouse)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#0284c7"; // primary-600 color
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  // Canvas drawing events (Touch)
  const getTouchPos = (
    canvas: HTMLCanvasElement,
    touchEvent: React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top,
    };
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getTouchPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    e.preventDefault();
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getTouchPos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Save Signature pad image
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedDoc || !selectedDeal) return;

    const dataUrl = canvas.toDataURL();

    setDealsList((prev) =>
      prev.map((d) => {
        if (d.id === selectedDeal.id) {
          return {
            ...d,
            documents: d.documents.map((doc) => {
              if (doc.id === selectedDoc.id) {
                return {
                  ...doc,
                  status: "Signed",
                  signedBy: user?.name || "Authorized Signatory",
                  signedDate: new Date().toISOString().split("T")[0],
                  signatureDataUrl: dataUrl,
                };
              }
              return doc;
            }),
          };
        }
        return d;
      }),
    );

    toast.success("Document signed successfully!");
    setIsSigning(false);
  };

  // Mock File Upload Trigger
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedDeal) return;

    const file = files[0];
    const newDoc: DealDocument = {
      id: `doc-${selectedDeal.id}-${Date.now()}`,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "DOC",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      lastModified: new Date().toISOString().split("T")[0],
      status: "Draft",
      contentMock: [
        `MOCK DOCUMENT: ${file.name.toUpperCase()}`,
        `UPLOADED BY: ${user?.name || "User"}`,
        `UPLOAD DATE: ${new Date().toLocaleDateString()}`,
        "This document has been mock uploaded to the Deal Chamber.",
        "It is currently in Draft status and is pending review/signature.",
      ],
    };

    setDealsList((prev) =>
      prev.map((d) => {
        if (d.id === selectedDeal.id) {
          return {
            ...d,
            documents: [newDoc, ...d.documents],
          };
        }
        return d;
      }),
    );

    toast.success("Document uploaded successfully!");
    setSelectedDoc(newDoc);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete Document helper
  const handleDeleteDoc = (docId: string) => {
    if (!selectedDeal) return;

    setDealsList((prev) =>
      prev.map((d) => {
        if (d.id === selectedDeal.id) {
          return {
            ...d,
            documents: d.documents.filter((doc) => doc.id !== docId),
          };
        }
        return d;
      }),
    );

    toast.success("Document deleted.");
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
  };

  // Filter deals
  const filteredDeals = dealsList.filter((deal) => {
    const matchesSearch =
      deal.startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.startup.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(deal.status);

    return matchesSearch && matchesStatus;
  });

  // SUB-VIEW: Render selected deal details (Document Chamber)
  if (selectedDeal) {
    const dealDetails =
      dealsList.find((d) => d.id === selectedDeal.id) || selectedDeal;
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Deal Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setSelectedDeal(null);
                setSelectedDoc(null);
                setIsSigning(false);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 text-gray-600"
              title="Back to pipeline"
            >
              <ArrowLeft size={18} />
            </button>
            <Avatar
              src={dealDetails.startup.logo}
              alt={dealDetails.startup.name}
              size="md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {dealDetails.startup.name}
                </h1>
                <Badge variant={getStatusColor(dealDetails.status)}>
                  {dealDetails.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {dealDetails.startup.industry} • {dealDetails.stage} •{" "}
                {dealDetails.amount} for {dealDetails.equity} equity
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <Button
              leftIcon={<Upload size={16} />}
              onClick={handleUploadClick}
              className="interactive-button"
            >
              Upload Doc
            </Button>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Documents list */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Document Chamber
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage termsheets, NDAs, and signature statuses
                </p>
              </CardHeader>
              <CardBody>
                {dealDetails.documents.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                    <FileText
                      size={40}
                      className="mx-auto text-gray-300 mb-3"
                    />
                    <p className="text-sm font-medium text-gray-700">
                      No documents in this chamber
                    </p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Upload a Termsheet or agreement to begin the deal signing
                      process
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadClick}
                    >
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dealDetails.documents.map((doc) => {
                      const isCurrentlySelected = selectedDoc?.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => {
                            setSelectedDoc(doc);
                            setIsSigning(false);
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isCurrentlySelected
                              ? "border-primary-500 bg-primary-50/50 shadow-sm"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div
                              className={`p-2.5 rounded-lg ${isCurrentlySelected ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}
                            >
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-gray-800 truncate">
                                {doc.name}
                              </h3>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                                <span>{doc.size}</span>
                                <span>•</span>
                                <span>Mod {doc.lastModified}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {getDocStatusBadge(doc.status)}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDoc(doc.id);
                              }}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-error-600 rounded-lg transition-all"
                              title="Delete contract"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column: PDF Preview / Signature Pad */}
          <div className="lg:col-span-1">
            {selectedDoc ? (
              <Card className="h-full border border-gray-200 shadow-sm flex flex-col justify-between">
                <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                      {selectedDoc.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Mock Contract Engine
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400"
                  >
                    <X size={16} />
                  </button>
                </CardHeader>

                <CardBody className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  {/* Paper Layout Mock Preview */}
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[10px] text-slate-700 space-y-3 min-h-[300px] shadow-inner relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-slate-900/5 px-2 py-0.5 rounded text-[8px] font-sans">
                      Page 1 of 1
                    </div>

                    <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center mx-auto mb-2 bg-white text-slate-400 shadow-sm">
                      <Lock size={12} />
                    </div>

                    {selectedDoc.contentMock.map((line, idx) => (
                      <p
                        key={idx}
                        className="leading-relaxed border-b border-slate-100 pb-1.5"
                      >
                        {line}
                      </p>
                    ))}

                    {/* Digital Signature stamp display if signed */}
                    {selectedDoc.status === "Signed" && (
                      <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex flex-col items-end space-y-1">
                        <div className="text-[9px] font-sans font-bold text-success-600 bg-success-50 border border-success-200 px-2 py-0.5 rounded flex items-center space-x-1 shadow-sm">
                          <CheckCircle2 size={10} />
                          <span>DIGITALLY SIGNED</span>
                        </div>
                        {selectedDoc.signatureDataUrl && (
                          <div className="bg-white border border-slate-200 p-1.5 rounded shadow-sm mt-1 max-w-[120px] transition-all">
                            <img
                              src={selectedDoc.signatureDataUrl}
                              alt="Signature stamp"
                              className="h-10 object-contain mx-auto"
                            />
                          </div>
                        )}
                        <span className="text-[8px] text-slate-500 font-sans mt-0.5">
                          Signed: {selectedDoc.signedBy}
                        </span>
                        <span className="text-[8px] text-slate-400 font-sans">
                          Date: {selectedDoc.signedDate}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sign Form toggle or pad */}
                  {selectedDoc.status !== "Signed" && (
                    <div className="pt-2 border-t border-gray-100">
                      {!isSigning ? (
                        <Button
                          fullWidth
                          leftIcon={<PenTool size={16} />}
                          onClick={() => setIsSigning(true)}
                          className="interactive-button"
                        >
                          Sign Document
                        </Button>
                      ) : (
                        <div className="space-y-3 bg-white p-3 border border-gray-200 rounded-xl shadow-md">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold text-gray-900 flex items-center">
                              <PenTool
                                size={12}
                                className="mr-1.5 text-primary-600"
                              />
                              Draw Signature
                            </h4>
                            <button
                              type="button"
                              onClick={clearSignature}
                              className="text-[10px] text-primary-600 hover:text-primary-500 font-semibold"
                            >
                              Clear pad
                            </button>
                          </div>

                          {/* Signature Drawing Board Canvas */}
                          <div className="border border-gray-200 rounded-lg bg-slate-50 shadow-inner overflow-hidden cursor-crosshair">
                            <canvas
                              ref={canvasRef}
                              width={240}
                              height={100}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawingTouch}
                              onTouchMove={drawTouch}
                              onTouchEnd={stopDrawing}
                              className="w-full h-[100px] bg-slate-50"
                            />
                          </div>

                          <p className="text-[9px] text-gray-500 leading-normal">
                            By clicking Confirm, I adopt this drawing as my
                            digital signature on this mock agreement.
                          </p>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsSigning(false)}
                              className="text-xs py-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveSignature}
                              className="text-xs py-1 interactive-button"
                            >
                              Confirm
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            ) : (
              <Card className="h-full border border-gray-200 shadow-sm">
                <CardBody className="p-8 text-center flex flex-col items-center justify-center min-h-[350px]">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <FileText size={20} className="text-gray-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    No Document Selected
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-[180px]">
                    Select any file in the chamber list to view previews,
                    download drafts, or sign contracts.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW: Render deals pipeline list
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Deals</h1>
          <p className="text-gray-600">
            Track and manage your investment pipeline & contract chambers
          </p>
        </div>

        <Button className="interactive-button">Add Deal</Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary-50 border border-primary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg mr-3">
                <DollarSign size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-primary-700 font-medium">
                  Total Investment
                </p>
                <p className="text-lg font-bold text-primary-900">$4.3M</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-secondary-50 border border-secondary-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg mr-3">
                <TrendingUp size={20} className="text-secondary-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-700 font-medium">
                  Active Deals
                </p>
                <p className="text-lg font-bold text-secondary-900">
                  {dealsList.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-accent-50 border border-accent-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-lg mr-3">
                <Users size={20} className="text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-accent-700 font-medium">
                  Portfolio Companies
                </p>
                <p className="text-lg font-bold text-accent-900">12</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-success-50 border border-success-100">
          <CardBody>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-3">
                <Calendar size={20} className="text-success-600" />
              </div>
              <div>
                <p className="text-sm text-success-700 font-medium">
                  Closed This Month
                </p>
                <p className="text-lg font-bold text-success-900">2</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search deals by startup name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>

        <div className="w-full md:w-1/3 flex items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Filter:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((status) => (
                <Badge
                  key={status}
                  variant={
                    selectedStatus.includes(status)
                      ? getStatusColor(status)
                      : "gray"
                  }
                  className="cursor-pointer text-[10px]"
                  onClick={() => toggleStatus(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deals table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Active Deals</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Startup
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={deal.startup.logo}
                          alt={deal.startup.name}
                          size="sm"
                          className="flex-shrink-0"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.startup.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {deal.startup.industry}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.equity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(deal.status)}>
                        {deal.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.stage}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium">
                        {deal.documents.length} files
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDeal(deal);
                          if (deal.documents.length > 0) {
                            setSelectedDoc(deal.documents[0]);
                          }
                        }}
                        className="interactive-button"
                      >
                        Document Chamber
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
