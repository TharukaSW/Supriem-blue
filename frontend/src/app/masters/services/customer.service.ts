import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface Customer {
    customerId: string;
    customerCode: string;
    customerName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    deactivatedAt?: string;
    deactivatedBy?: string;
    itemPrices?: CustomerItemPrice[];
}

export interface CustomerItemPrice {
    customerItemPriceId: string;
    customerId: string;
    itemId: string;
    unitPrice: number;
    effectiveFrom: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    updatedBy?: string;
    item?: any;
}

export interface CreateCustomerDto {
    customerCode: string;
    customerName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface UpdateCustomerDto {
    customerName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive?: boolean;
}

export interface CreateCustomerPriceDto {
    itemId: string;
    unitPrice: number;
    effectiveFrom?: string;
    endDate?: string;
}

export interface UpdateCustomerPriceDto {
    unitPrice?: number;
    endDate?: string;
    isActive?: boolean;
}

export interface CustomerQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    includePrices?: boolean;
}

export interface CustomerPriceQueryParams {
    itemId?: string;
    activeOnly?: boolean;
    asOfDate?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
    private readonly endpoint = 'masters/customers';

    constructor(private api: ApiService) { }

    getAll(params?: CustomerQueryParams): Observable<{ data: Customer[]; meta: any }> {
        return this.api.get(this.endpoint, params);
    }

    getOne(id: string, includePrices = false): Observable<Customer> {
        return this.api.get(`${this.endpoint}/${id}`, { includePrices });
    }

    create(data: CreateCustomerDto): Observable<Customer> {
        return this.api.post(this.endpoint, data);
    }

    update(id: string, data: UpdateCustomerDto): Observable<Customer> {
        return this.api.patch(`${this.endpoint}/${id}`, data);
    }

    deactivate(id: string, reason?: string): Observable<any> {
        return this.api.patch(`${this.endpoint}/${id}/deactivate`, { reason });
    }

    // Price management
    getPrices(customerId: string, params?: CustomerPriceQueryParams): Observable<CustomerItemPrice[]> {
        return this.api.get(`${this.endpoint}/${customerId}/prices`, params);
    }

    getActivePrice(customerId: string, itemId: string, asOfDate?: string): Observable<CustomerItemPrice | null> {
        return this.api.get(`${this.endpoint}/${customerId}/prices/active/${itemId}`, { asOfDate });
    }

    createPrice(customerId: string, data: CreateCustomerPriceDto): Observable<CustomerItemPrice> {
        return this.api.post(`${this.endpoint}/${customerId}/prices`, data);
    }

    updatePrice(customerId: string, priceId: string, data: UpdateCustomerPriceDto): Observable<CustomerItemPrice> {
        return this.api.put(`${this.endpoint}/${customerId}/prices/${priceId}`, data);
    }

    deactivatePrice(customerId: string, priceId: string, endDate?: string): Observable<any> {
        return this.api.put(`${this.endpoint}/${customerId}/prices/${priceId}/deactivate`, { endDate });
    }
}
