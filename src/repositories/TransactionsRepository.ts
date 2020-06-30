import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

interface Accumulator {
  income: Transaction[];
  outcome: Transaction[];
}
class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const initialValue: Accumulator = { income: [], outcome: [] };
    const groupByType: Accumulator = this.transactions.reduce(
      (acc, obj: Transaction) => {
        const key = obj.type;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
      },
      initialValue,
    );

    if (this.transactions.length < 1) {
      return {
        income: 0,
        outcome: 0,
        total: 0,
      };
    }

    const outcome = groupByType.outcome
      ? groupByType.outcome.reduce((acc, obj) => {
          return acc + obj.value;
        }, 0)
      : 0;
    const income = groupByType.income
      ? groupByType.income.reduce((acc, obj) => {
          return acc + obj.value;
        }, 0)
      : 0;

    const total = income - outcome;

    return { income, outcome, total };
  }

  public create({ title, value, type }: CreateTransactionDTO): Transaction {
    const transaction = new Transaction({ title, value, type });

    const balance = this.getBalance();
    const checkBalance = balance.total - value;

    if (type === 'outcome' && checkBalance < 0) {
      throw Error('Transaction refused. Cause balance to be negative.');
    }

    this.transactions.push(transaction);

    return transaction;
  }
}

export default TransactionsRepository;
