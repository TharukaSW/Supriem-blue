import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Enums
export enum DocStatus {
    DRAFT = 'DRAFT',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    DELIVERED = 'DELIVERED'
}

// Interfaces
export interface Item {
    itemId: string;
    itemCode: string;
    itemName: string;
    itemType: string;
    unit?: {
        unitId: string;
        unitName: string;
        symbol: string;
    };
    sellingPrice?: number;
}

export interface Customer {
    customerId: string;
    customerCode: string;
    customerName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface SalesOrderLine {
    salesOrderLineId?: string;
    itemId: string;
    item?: Item;
    qty: number;
    unitPrice: number;
    lineTotal?: number;
}

export interface SalesOrder {
    salesOrderId: string;
    orderNo: string;
    customerId: string;
    customer?: Customer;
    orderDate: string;
    status: DocStatus;
    notes?: string;
    discount: number;
    tax: number;
    subtotal: number;
    total: number;
    lines: SalesOrderLine[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    confirmedAt?: string;
    confirmedBy?: string;
}

export interface Dispatch {
    dispatchId: string;
    dispatchNo: string;
    salesOrderId: string;
    salesOrder?: SalesOrder;
    dispatchDate: string;
    vehicleNo?: string;
    driverName?: string;
    remarks?: string;
    status: DocStatus;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}

// DTOs
export interface CreateSalesOrderDto {
    customerId: string;
    orderDate?: string;
    notes?: string;
    discount?: number;
    tax?: number;
    lines: {
        itemId: string;
        qty: number;
        unitPrice?: number;
    }[];
}

export interface UpdateSalesOrderDto {
    notes?: string;
    discount?: number;
    tax?: number;
}

export interface SalesQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: DocStatus;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
}

export interface CreateDispatchDto {
    salesOrderId: string;
    vehicleNo?: string;
    driverName?: string;
    remarks?: string;
}

export interface DispatchQueryDto {
    page?: number;
    limit?: number;
    status?: DocStatus;
    fromDate?: string;
    toDate?: string;
}

export interface ApiResponse<T> {
    data: T;
    total?: number;
    page?: number;
    limit?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SalesService {
    private apiUrl = `${environment.apiUrl}/sales`;

    constructor(private http: HttpClient) { }

    // ========== SALES ORDERS ==========

    /**
     * Get all sales orders with optional filters
     */
    getSalesOrders(query?: SalesQueryDto): Observable<ApiResponse<SalesOrder[]>> {
        let params = new HttpParams();
        if (query) {
            if (query.page) params = params.set('page', query.page.toString());
            if (query.limit) params = params.set('limit', query.limit.toString());
            if (query.search) params = params.set('search', query.search);
            if (query.status) params = params.set('status', query.status);
            if (query.customerId) params = params.set('customerId', query.customerId);
            if (query.fromDate) params = params.set('fromDate', query.fromDate);
            if (query.toDate) params = params.set('toDate', query.toDate);
        }
        return this.http.get<ApiResponse<SalesOrder[]>>(`${this.apiUrl}/orders`, { params });
    }

    /**
     * Get a single sales order by ID
     */
    getSalesOrder(id: string): Observable<SalesOrder> {
        return this.http.get<SalesOrder>(`${this.apiUrl}/orders/${id}`);
    }

    /**
     * Create a new sales order
     */
    createSalesOrder(dto: CreateSalesOrderDto): Observable<SalesOrder> {
        return this.http.post<SalesOrder>(`${this.apiUrl}/orders`, dto);
    }

    /**
     * Update an existing sales order
     */
    updateSalesOrder(id: string, dto: UpdateSalesOrderDto): Observable<SalesOrder> {
        return this.http.put<SalesOrder>(`${this.apiUrl}/orders/${id}`, dto);
    }

    /**
     * Confirm a sales order
     */
    confirmSalesOrder(id: string): Observable<SalesOrder> {
        return this.http.post<SalesOrder>(`${this.apiUrl}/orders/${id}/confirm`, {});
    }

    /**
     * Cancel a sales order
     */
    cancelSalesOrder(id: string): Observable<SalesOrder> {
        return this.http.post<SalesOrder>(`${this.apiUrl}/orders/${id}/cancel`, {});
    }

    // ========== DISPATCHES ==========

    /**
     * Get all dispatches with optional filters
     */
    getDispatches(query?: DispatchQueryDto): Observable<ApiResponse<Dispatch[]>> {
        let params = new HttpParams();
        if (query) {
            if (query.page) params = params.set('page', query.page.toString());
            if (query.limit) params = params.set('limit', query.limit.toString());
            if (query.status) params = params.set('status', query.status);
            if (query.fromDate) params = params.set('fromDate', query.fromDate);
            if (query.toDate) params = params.set('toDate', query.toDate);
        }
        return this.http.get<ApiResponse<Dispatch[]>>(`${this.apiUrl}/dispatches`, { params });
    }

    /**
     * Get a single dispatch by ID
     */
    getDispatch(id: string): Observable<Dispatch> {
        return this.http.get<Dispatch>(`${this.apiUrl}/dispatches/${id}`);
    }

    /**
     * Create a new dispatch
     */
    createDispatch(dto: CreateDispatchDto): Observable<Dispatch> {
        return this.http.post<Dispatch>(`${this.apiUrl}/dispatches`, dto);
    }

    /**
     * Mark a dispatch as delivered
     */
    markDispatchDelivered(id: string): Observable<Dispatch> {
        return this.http.post<Dispatch>(`${this.apiUrl}/dispatches/${id}/deliver`, {});
    }
}
