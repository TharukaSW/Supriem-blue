import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface Item {
    itemId: string;
    itemCode: string;
    itemName: string;
    itemType: 'RAW' | 'PRODUCT' | 'SERVICE';
    categoryId?: number;
    unitId?: number;
    sellingPrice?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category?: any;
    unit?: any;
}

export interface ItemQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    itemType?: 'RAW' | 'PRODUCT' | 'SERVICE';
    categoryId?: number;
    isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
    private readonly endpoint = 'masters/items';

    constructor(private api: ApiService) { }

    getAll(params?: ItemQueryParams): Observable<{ data: Item[]; meta: any }> {
        return this.api.get(this.endpoint, params);
    }

    getOne(id: string): Observable<Item> {
        return this.api.get(`${this.endpoint}/${id}`);
    }

    getRawMaterials(): Observable<{ data: Item[]; meta: any }> {
        return this.api.get(this.endpoint, { itemType: 'RAW', isActive: true, limit: 1000 });
    }

    getProducts(): Observable<{ data: Item[]; meta: any }> {
        return this.api.get(this.endpoint, { itemType: 'PRODUCT', isActive: true, limit: 1000 });
    }

    getFinishedGoods(): Observable<{ data: Item[]; meta: any }> {
        return this.api.get(this.endpoint, { itemType: 'PRODUCT', isActive: true, limit: 1000 });
    }

    create(data: any): Observable<Item> {
        return this.api.post(this.endpoint, data);
    }

    update(id: string, data: any): Observable<Item> {
        return this.api.put(`${this.endpoint}/${id}`, data);
    }

    delete(id: string): Observable<any> {
        return this.api.delete(`${this.endpoint}/${id}`);
    }
}
