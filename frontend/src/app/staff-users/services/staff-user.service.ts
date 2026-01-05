import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface StaffUserRole {
    roleId: number;
    roleName: string;
    idPrefix?: string;
}

export interface StaffUser {
    userId: string;
    userCode: string;
    roleId: number;
    fullName: string;
    username?: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    role?: StaffUserRole;
}

export interface StaffUserListResponse {
    data: StaffUser[];
    meta?: any;
}

export interface StaffUserQueryParams {
    page?: number;
    limit?: number;
    roleId?: number;
    search?: string;
}

@Injectable({ providedIn: 'root' })
export class StaffUserService {
    private readonly endpoint = 'users';

    constructor(private api: ApiService) { }

    getAll(params?: StaffUserQueryParams): Observable<StaffUserListResponse | StaffUser[]> {
        return this.api.get(this.endpoint, params);
    }

    getRoles(): Observable<Array<{ roleId: number; roleName: string }>> {
        return this.api.get(`${this.endpoint}/roles`);
    }

    create(data: any): Observable<StaffUser> {
        return this.api.post(this.endpoint, data);
    }

    update(id: string, data: any): Observable<StaffUser> {
        return this.api.put(`${this.endpoint}/${id}`, data);
    }
}
