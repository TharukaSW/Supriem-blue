import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  expenseId: string;
  expenseNo: string;
  expenseDate: string;
  category: string;
  description?: string;
  amount: number;
  method: 'CASH' | 'BANK' | 'CARD' | 'UPI';
  paidTo?: string;
  supplierId?: string;
  supplier?: any;
  creator?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateExpenseDto {
  expenseDate?: string;
  category: string;
  description?: string;
  amount: number;
  method?: 'CASH' | 'BANK' | 'CARD' | 'UPI';
  paidTo?: string;
  supplierId?: string;
}

export interface UpdateExpenseDto {
  category?: string;
  description?: string;
  amount?: number;
  method?: 'CASH' | 'BANK' | 'CARD' | 'UPI';
  paidTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/finance/expenses`;

  constructor(private http: HttpClient) { }

  getExpenses(params?: ExpenseQueryParams): Observable<{ data: Expense[]; meta: any }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<{ data: Expense[]; meta: any }>(this.apiUrl, { params: httpParams });
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  createExpense(data: CreateExpenseDto): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, data);
  }

  updateExpense(id: string, data: UpdateExpenseDto): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, data);
  }
}
