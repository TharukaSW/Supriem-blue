import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface Supplier {
    supplierId: string;
    supplierCode: string;
    supplierName: string;
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
    itemPrices?: SupplierItemPrice[];
}

export interface SupplierItemPrice {
    supplierItemPriceId: string;
    supplierId: string;
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

export interface CreateSupplierDto {
    supplierCode: string;
    supplierName: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface UpdateSupplierDto {
    supplierName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    isActive?: boolean;
}

export interface CreateSupplierPriceDto {
    itemId: string;
    unitPrice: number;
    effectiveFrom?: string;
    endDate?: string;
}

export interface UpdateSupplierPriceDto {
    unitPrice?: number;
    endDate?: string;
    isActive?: boolean;
}

export interface SupplierQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    includePrices?: boolean;
}

export interface SupplierPriceQueryParams {
    itemId?: string;
    activeOnly?: boolean;
    asOfDate?: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierService {
    private readonly endpoint = 'masters/suppliers';

    constructor(private api: ApiService) { }

    getAll(params?: SupplierQueryParams): Observable<{ data: Supplier[]; meta: any }> {
        return this.api.get(this.endpoint, params);
    }

    getOne(id: string, includePrices = false): Observable<Supplier> {
        return this.api.get(`${this.endpoint}/${id}`, { includePrices });
    }

    create(data: CreateSupplierDto): Observable<Supplier> {
        return this.api.post(this.endpoint, data);
    }

    update(id: string, data: UpdateSupplierDto): Observable<Supplier> {
        return this.api.patch(`${this.endpoint}/${id}`, data);
    }

    deactivate(id: string, reason?: string): Observable<any> {
        return this.api.patch(`${this.endpoint}/${id}/deactivate`, { reason });
    }

    // Price management
    getPrices(supplierId: string, params?: SupplierPriceQueryParams): Observable<SupplierItemPrice[]> {
        return this.api.get(`${this.endpoint}/${supplierId}/prices`, params);
    }

    getActivePrice(supplierId: string, itemId: string, asOfDate?: string): Observable<SupplierItemPrice | null> {
        return this.api.get(`${this.endpoint}/${supplierId}/prices/active/${itemId}`, { asOfDate });
    }

    createPrice(supplierId: string, data: CreateSupplierPriceDto): Observable<SupplierItemPrice> {
        return this.api.post(`${this.endpoint}/${supplierId}/prices`, data);
    }

    updatePrice(supplierId: string, priceId: string, data: UpdateSupplierPriceDto): Observable<SupplierItemPrice> {
        return this.api.put(`${this.endpoint}/${supplierId}/prices/${priceId}`, data);
    }

    deactivatePrice(supplierId: string, priceId: string, endDate?: string): Observable<any> {
        return this.api.put(`${this.endpoint}/${supplierId}/prices/${priceId}/deactivate`, { endDate });
    }
}
