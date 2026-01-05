import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface LabourerRole {
    roleId: number;
    roleName: string;
    idPrefix?: string;
}

export interface LabourerEmployeeProfile {
    userId: string;
    nic?: string;
    address?: string;
    joinedDate?: string;
    designation?: string;
    basicSalary: number;
    salaryRangeId?: string;
    otRate: number;
    notes?: string;
    salaryRange?: {
        rangeName: string;
        minSalary: number;
        maxSalary: number;
    };
}

export interface Labourer {
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
    role?: LabourerRole;
    employeeProfile?: LabourerEmployeeProfile;
}

export interface LabourerListResponse {
    data: Labourer[];
    meta?: any;
}

export interface LabourerQueryParams {
    page?: number;
    limit?: number;
    includeEmployee?: boolean;
    roleId?: number;
    search?: string;
}

@Injectable({ providedIn: 'root' })
export class LabourerService {
    private readonly endpoint = 'users';

    constructor(private api: ApiService) { }

    getAll(params?: LabourerQueryParams): Observable<LabourerListResponse | Labourer[]> {
        return this.api.get(this.endpoint, params);
    }

    getOne(id: string, includeEmployee = true): Observable<Labourer> {
        return this.api.get(`${this.endpoint}/${id}`, { includeEmployee });
    }

    getRoles(): Observable<Array<{ roleId: number; roleName: string }>> {
        return this.api.get(`${this.endpoint}/roles`);
    }

    create(data: any): Observable<Labourer> {
        return this.api.post(this.endpoint, data);
    }

    update(id: string, data: any): Observable<Labourer> {
        return this.api.put(`${this.endpoint}/${id}`, data);
    }

    updateEmployeeProfile(userId: string, data: { address?: string }): Observable<any> {
        return this.api.put(`attendance/employees/${userId}/profile`, data);
    }
}
