export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'funding';
  amount: number;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  description: string;
  status: 'succeeded' | 'pending' | 'failed';
  date: string;
}

// Initial balances map
const DEFAULT_BALANCES: Record<string, number> = {
  'e1': 75000,     // Sarah Johnson (Entrepreneur)
  'e2': 40000,     // David Chen (Entrepreneur)
  'i1': 5000000,   // Michael Rodriguez (Investor)
  'i2': 3500000,   // Jennifer Lee (Investor)
};

// Initial mock transactions
const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 5000000,
    senderId: 'i1',
    senderName: 'Bank Account (•••• 8821)',
    receiverId: 'i1',
    receiverName: 'Michael Rodriguez (Wallet)',
    description: 'Wire Transfer Deposit',
    status: 'succeeded',
    date: '2026-02-01 10:30'
  },
  {
    id: 'tx-2',
    type: 'deposit',
    amount: 100000,
    senderId: 'e1',
    senderName: 'Card Payment (•••• 4242)',
    receiverId: 'e1',
    receiverName: 'Sarah Johnson (Wallet)',
    description: 'Stripe Account Deposit',
    status: 'succeeded',
    date: '2026-02-02 14:15'
  },
  {
    id: 'tx-3',
    type: 'withdraw',
    amount: 25000,
    senderId: 'e1',
    senderName: 'Sarah Johnson (Wallet)',
    receiverId: 'e1',
    receiverName: 'PayPal (sarah.j@techwave.ai)',
    description: 'Transfer to PayPal',
    status: 'succeeded',
    date: '2026-02-05 09:00'
  },
  {
    id: 'tx-4',
    type: 'transfer',
    amount: 5000,
    senderId: 'i1',
    senderName: 'Michael Rodriguez',
    receiverId: 'e1',
    receiverName: 'Sarah Johnson',
    description: 'Due Diligence Research Sponsorship',
    status: 'succeeded',
    date: '2026-02-12 16:45'
  }
];

// Helper to initialize LocalStorage collections
const initializeStorage = () => {
  if (!localStorage.getItem('business_nexus_balances')) {
    localStorage.setItem('business_nexus_balances', JSON.stringify(DEFAULT_BALANCES));
  }
  if (!localStorage.getItem('business_nexus_transactions')) {
    localStorage.setItem('business_nexus_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
  }
};

// Retrieve User Wallet Balance
export const getWalletBalance = (userId: string): number => {
  initializeStorage();
  const balances = JSON.parse(localStorage.getItem('business_nexus_balances') || '{}');
  return balances[userId] !== undefined ? balances[userId] : 0;
};

// Update User Wallet Balance
const updateWalletBalance = (userId: string, newBalance: number) => {
  initializeStorage();
  const balances = JSON.parse(localStorage.getItem('business_nexus_balances') || '{}');
  balances[userId] = newBalance;
  localStorage.setItem('business_nexus_balances', JSON.stringify(balances));
};

// Retrieve User Transaction History
export const getTransactionsForUser = (userId: string): Transaction[] => {
  initializeStorage();
  const txs: Transaction[] = JSON.parse(localStorage.getItem('business_nexus_transactions') || '[]');
  // Return transactions where the user was either the sender or receiver
  return txs.filter(t => t.senderId === userId || t.receiverId === userId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Log Transaction helper
const logTransaction = (tx: Transaction) => {
  initializeStorage();
  const txs: Transaction[] = JSON.parse(localStorage.getItem('business_nexus_transactions') || '[]');
  txs.push(tx);
  localStorage.setItem('business_nexus_transactions', JSON.stringify(txs));
};

// Process Deposit Simulation (Stripe Card)
export const depositFunds = (userId: string, userName: string, amount: number, cardLast4: string): number => {
  const currentBalance = getWalletBalance(userId);
  const newBalance = currentBalance + amount;
  updateWalletBalance(userId, newBalance);

  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    type: 'deposit',
    amount,
    senderId: userId,
    senderName: `Stripe Card (•••• ${cardLast4})`,
    receiverId: userId,
    receiverName: `${userName} (Wallet)`,
    description: 'Stripe Deposit',
    status: 'succeeded',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logTransaction(tx);
  return newBalance;
};

// Process Withdrawal Simulation (PayPal Account)
export const withdrawFunds = (userId: string, userName: string, amount: number, paypalEmail: string): number => {
  const currentBalance = getWalletBalance(userId);
  if (currentBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  const newBalance = currentBalance - amount;
  updateWalletBalance(userId, newBalance);

  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    type: 'withdraw',
    amount,
    senderId: userId,
    senderName: `${userName} (Wallet)`,
    receiverId: userId,
    receiverName: `PayPal (${paypalEmail})`,
    description: 'PayPal Withdrawal',
    status: 'succeeded',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logTransaction(tx);
  return newBalance;
};

// Process Peer Transfer / Funding (Stripe/PayPal direct link)
export const transferFunds = (
  senderId: string, 
  senderName: string,
  receiverId: string, 
  receiverName: string,
  amount: number, 
  description: string,
  type: 'transfer' | 'funding' = 'transfer'
): boolean => {
  const senderBalance = getWalletBalance(senderId);
  if (senderBalance < amount) {
    return false; // Insufficient balance
  }

  const receiverBalance = getWalletBalance(receiverId);

  updateWalletBalance(senderId, senderBalance - amount);
  updateWalletBalance(receiverId, receiverBalance + amount);

  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    type,
    amount,
    senderId,
    senderName,
    receiverId,
    receiverName,
    description,
    status: 'succeeded',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  logTransaction(tx);
  return true;
};
