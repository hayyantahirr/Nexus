import React, { useState, useEffect } from "react";
import { Send, Search, Plus, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import {
  getWalletBalance,
  getTransactionsForUser,
  depositFunds,
  withdrawFunds,
  transferFunds,
  Transaction,
} from "../../data/wallet";
import { findUserById, users } from "../../data/users";
import toast from "react-hot-toast";

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Forms states
  const [depositAmount, setDepositAmount] = useState("1000");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("342");

  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [paypalEmail, setPaypalEmail] = useState("");

  const [transferAmount, setTransferAmount] = useState("1000");
  const [recipientId, setRecipientId] = useState("");
  const [transferDesc, setTransferDesc] = useState("");

  // Reload trigger
  const [reloadKey, setReloadKey] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "deposit" | "withdraw" | "transfer"
  >("deposit");

  useEffect(() => {
    if (user) {
      setBalance(getWalletBalance(user.id));
      setTransactions(getTransactionsForUser(user.id));
      if (paypalEmail === "") {
        setPaypalEmail(user.email);
      }
    }
  }, [user, reloadKey]);

  if (!user) return null;

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Process Deposit (Stripe style)
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid deposit amount");
      return;
    }

    const last4 = cardNumber.replace(/\s/g, "").slice(-4) || "4242";
    const newBal = depositFunds(user.id, user.name, amt, last4);

    setBalance(newBal);
    setReloadKey((prev) => prev + 1);
    toast.success(`Deposited ${formatCurrency(amt)} via Stripe!`);
  };

  // Process Withdrawal (PayPal style)
  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid withdrawal amount");
      return;
    }

    if (balance < amt) {
      toast.error("Insufficient wallet balance");
      return;
    }

    try {
      const newBal = withdrawFunds(user.id, user.name, amt, paypalEmail);
      setBalance(newBal);
      setReloadKey((prev) => prev + 1);
      toast.success(`Withdrew ${formatCurrency(amt)} to PayPal!`);
    } catch (err: any) {
      toast.error(err.message || "Withdrawal failed");
    }
  };

  // Process Transfer (Peer-to-Peer)
  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid transfer amount");
      return;
    }

    if (!recipientId) {
      toast.error("Please select a recipient");
      return;
    }

    if (recipientId === user.id) {
      toast.error("Cannot transfer to yourself");
      return;
    }

    if (balance < amt) {
      toast.error("Insufficient balance");
      return;
    }

    const recipient = findUserById(recipientId);
    if (!recipient) {
      toast.error("Recipient not found");
      return;
    }

    const success = transferFunds(
      user.id,
      user.name,
      recipient.id,
      recipient.name,
      amt,
      transferDesc || "Direct Transfer",
    );

    if (success) {
      setReloadKey((prev) => prev + 1);
      setTransferDesc("");
      toast.success(`Transferred ${formatCurrency(amt)} to ${recipient.name}!`);
    } else {
      toast.error("Transfer failed due to insufficient balance.");
    }
  };

  // Filter Transactions
  const filteredTxs = transactions.filter((t) => {
    return (
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter recipient options
  const recipientOptions = users.filter((u) => u.id !== user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
        <p className="text-gray-600">
          Simulate fund transfers, termsheet closings, and Stripe billing
          options
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metallic Credit Card & Stripe/PayPal tabs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Metal Credit Card design */}
          <div className="relative h-48 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-primary-950 p-6 text-white shadow-2xl overflow-hidden border border-white/10 flex flex-col justify-between">
            {/* Background geometric accents */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] pointer-events-none"></div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  NEXUS WALLET
                </p>
                <h3 className="text-lg font-bold text-slate-100 mt-1">
                  {user.name}
                </h3>
              </div>
              <div className="w-10 h-7 bg-white/10 rounded border border-white/10 flex items-center justify-center font-bold text-xs tracking-wider">
                DEAL
              </div>
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-wider text-slate-400">
                Available Balance
              </p>
              <h2 className="text-2xl font-extrabold font-mono tracking-tight mt-0.5 text-white">
                {formatCurrency(balance)}
              </h2>
            </div>

            <div className="flex justify-between items-end text-[10px] text-slate-400 font-mono">
              <span>ACC NO: **** **** **** {user.id.toUpperCase()}</span>
              <span>EXP: 12/30</span>
            </div>
          </div>

          {/* Deposit/Withdraw/Transfer Operations Box */}
          <Card>
            <CardBody className="p-4 space-y-4">
              <div className="bg-slate-100 p-1.5 rounded-xl flex space-x-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("deposit")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
                    activeTab === "deposit"
                      ? "bg-white text-primary-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("withdraw")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
                    activeTab === "withdraw"
                      ? "bg-white text-primary-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Withdraw
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transfer")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
                    activeTab === "transfer"
                      ? "bg-white text-primary-600 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Transfer
                </button>
              </div>
              {/* TAB 1: Stripe deposit simulation */}
              {activeTab === "deposit" && (
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span className="font-semibold text-primary-600">
                      Simulate Stripe Checkout
                    </span>
                    <span>Card Sandbox</span>
                  </div>

                  <Input
                    label="Amount (USD)"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    min="1"
                  />

                  <Input
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    required
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Expires"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                    <Input
                      label="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="342"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    leftIcon={<Plus size={16} />}
                    className="interactive-button"
                  >
                    Deposit {formatCurrency(parseFloat(depositAmount) || 0)}
                  </Button>
                </form>
              )}

              {/* TAB 2: Withdraw Simulation */}
              {activeTab === "withdraw" && (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <Input
                    label="Amount to Withdraw"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    min="1"
                  />

                  <Input
                    label="PayPal Email Recipient"
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    required
                    placeholder="email@paypal.com"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    className="interactive-button"
                  >
                    Withdraw {formatCurrency(parseFloat(withdrawAmount) || 0)}
                  </Button>
                </form>
              )}

              {/* TAB 3: Transfer to peer */}
              {activeTab === "transfer" && (
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Recipient Member
                    </label>
                    <select
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                      required
                    >
                      <option value="">-- Choose Recipient --</option>
                      {recipientOptions.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Transfer Amount"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                    min="1"
                  />

                  <Input
                    label="Memo / Description"
                    value={transferDesc}
                    onChange={(e) => setTransferDesc(e.target.value)}
                    placeholder="Direct transfer description..."
                  />

                  <Button
                    type="submit"
                    fullWidth
                    leftIcon={<Send size={16} />}
                    className="interactive-button"
                  >
                    Transfer {formatCurrency(parseFloat(transferAmount) || 0)}
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Transaction Logs */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center py-3.5">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>
              <div className="w-64">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  startAdornment={<Search size={14} />}
                />
              </div>
            </CardHeader>
            <CardBody>
              {filteredTxs.length === 0 ? (
                <p className="text-center py-12 text-gray-400 italic">
                  No transaction records found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 font-medium text-xs">
                        <th className="px-4 py-2.5 text-left uppercase">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left uppercase">
                          Description
                        </th>
                        <th className="px-4 py-2.5 text-left uppercase">
                          Parties
                        </th>
                        <th className="px-4 py-2.5 text-left uppercase">
                          Date
                        </th>
                        <th className="px-4 py-2.5 text-right uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-2.5 text-right uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-800">
                      {filteredTxs.map((tx) => {
                        const isIncome =
                          tx.receiverId === user.id && tx.type !== "deposit";
                        const isOutcome =
                          tx.senderId === user.id && tx.type !== "withdraw";

                        let typeBadgeColor = "gray";
                        if (tx.type === "deposit") typeBadgeColor = "success";
                        else if (tx.type === "withdraw")
                          typeBadgeColor = "error";
                        else if (tx.type === "funding")
                          typeBadgeColor = "primary";
                        else typeBadgeColor = "secondary";

                        return (
                          <tr key={tx.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge
                                variant={typeBadgeColor as any}
                                className="text-[10px] uppercase font-semibold"
                              >
                                {tx.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">
                                {tx.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500">
                              <div className="truncate max-w-[150px]">
                                From: {tx.senderName}
                              </div>
                              <div className="truncate max-w-[150px] mt-0.5">
                                To: {tx.receiverName}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                              {tx.date}
                            </td>
                            <td
                              className={`px-4 py-3 whitespace-nowrap text-right font-bold ${
                                tx.type === "deposit" || isIncome
                                  ? "text-success-600"
                                  : "text-error-600"
                              }`}
                            >
                              {tx.type === "deposit" || isIncome ? "+" : "-"}
                              {formatCurrency(tx.amount)}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <span className="inline-flex items-center text-xs text-success-700 bg-success-50 px-1.5 py-0.5 rounded-full font-medium">
                                <CheckCircle2 size={10} className="mr-1" />
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
