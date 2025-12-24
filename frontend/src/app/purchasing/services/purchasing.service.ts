import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PurchaseOrder {
  purchaseId: string;
  purchaseNo: string;
  supplier: any;
  purchaseDate: string;
  status: string;
  notes?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  lines: PurchaseOrderLine[];
  invoices?: any[];
  createdAt: string;
  receivedAt?: string;
}

export interface PurchaseOrderLine {
  purchaseLineId?: string;
  itemId: number;
  item?: any;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  priceSource?: string;
  overrideReason?: string;
}

export interface PurchaseInvoice {
  invoiceId: string;
  invoiceNo: string;
  invoiceDate: string;
  supplier: any;
  purchaseOrder?: any;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  matchStatus: string;
  vendorInvoiceNo?: string;
  vendorInvoiceTotal?: number;
  mismatchAmount?: number;
  lines: any[];
  payments?: Payment[];
}

export interface Payment {
  paymentId: string;
  paymentNo: string;
  paymentDate: string;
  amount: number;
  method: string;
  referenceNo?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PurchasingService {
  private apiUrl = `${environment.apiUrl}/purchases`;
  private invoiceUrl = `${environment.apiUrl}/purchase-invoices`;
  private paymentUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // Purchase Orders
  getPurchaseOrders(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getPurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  createPurchaseOrder(data: any): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, data);
  }

  updatePurchaseOrder(id: string, data: any): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}`, data);
  }

  confirmPurchaseOrder(id: string): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/confirm`, {});
  }

  receivePurchaseOrder(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/receive`, {});
  }

  cancelPurchaseOrder(id: string, reason?: string): Observable<PurchaseOrder> {
    return this.http.patch<PurchaseOrder>(`${this.apiUrl}/${id}/cancel`, {
      cancelReason: reason,
    });
  }

  getSupplierItemPrice(
    supplierId: string,
    itemId: string,
    asOfDate?: string,
  ): Observable<any> {
    let params = new HttpParams();
    if (asOfDate) {
      params = params.set('asOfDate', asOfDate);
    }
    return this.http.get<any>(
      `${this.apiUrl}/suppliers/${supplierId}/items/${itemId}/active-price`,
      { params },
    );
  }

  // Invoices
  getPurchaseInvoices(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(this.invoiceUrl, { params: httpParams });
  }

  getPurchaseInvoice(id: string): Observable<PurchaseInvoice> {
    return this.http.get<PurchaseInvoice>(`${this.invoiceUrl}/${id}`);
  }

  matchInvoice(id: string, data: any): Observable<PurchaseInvoice> {
    return this.http.patch<PurchaseInvoice>(`${this.invoiceUrl}/${id}/match`, data);
  }

  downloadInvoicePdf(id: string, template: string = 'DOT_MATRIX'): Observable<Blob> {
    return this.http.get(`${this.invoiceUrl}/${id}/pdf?template=${template}`, {
      responseType: 'blob',
    });
  }

  // Payments
  createPayment(invoiceId: string, data: any): Observable<Payment> {
    return this.http.post<Payment>(`${this.invoiceUrl}/${invoiceId}/payments`, data);
  }

  getInvoicePayments(invoiceId: string): Observable<any> {
    return this.http.get<any>(`${this.invoiceUrl}/${invoiceId}/payments`);
  }

  getAllPayments(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(this.paymentUrl, { params: httpParams });
  }
}
