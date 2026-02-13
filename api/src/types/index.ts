export interface Transaction {
  id: string
  created_at: string
  type: 'income' | 'expense' | 'debt_payment'
  amount: number
  category: string
  note: string
  source: 'manual' | 'ocr'
  debt_id: string | null
  is_deleted: number
}

export interface Debt {
  id: string
  platform: string
  product_name: string
  total_amount: number
  remaining_amount: number
  monthly_installment: number
  total_installments: number
  paid_installments: number
  next_due_date: string
  status: 'active' | 'paid_off'
  created_at: string
}

export interface DebtSchedule {
  id: string
  debt_id: string
  due_date: string
  amount: number
  status: 'pending' | 'paid' | 'overdue'
  paid_at: string | null
  paid_amount: number | null
}

export interface MonthlyExpense {
  id: string
  name: string
  emoji: string
  amount: number
  is_deleted: number
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
