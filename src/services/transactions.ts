export const mockTransactionService = {
  getTransactions: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return [
      {
        id: 'txn-1',
        amount: 10,
        type: 'credit' as const,
        reason: 'Completed: Foundations of Web Development',
        status: 'completed' as const,
        timestamp: '2024-01-20T10:00:00Z'
      },
      {
        id: 'txn-2',
        amount: 15,
        type: 'credit' as const,
        reason: 'Completed: Introduction to React',
        status: 'completed' as const,
        timestamp: '2024-02-01T14:30:00Z'
      },
      {
        id: 'txn-3',
        amount: 20,
        type: 'debit' as const,
        reason: 'Withdrawal',
        status: 'completed' as const,
        timestamp: '2024-02-05T09:00:00Z'
      }
    ];
  }
};
