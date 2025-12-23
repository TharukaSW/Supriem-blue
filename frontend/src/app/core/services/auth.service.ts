import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface User {
    userId: string;
    userCode: string;
    fullName: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/auth`;

    private _user = signal<User | null>(null);
    private _token = signal<string | null>(null);

    user = this._user.asReadonly();
    isAuthenticated = computed(() => !!this._token());

    constructor(private http: HttpClient, private router: Router) {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        if (token && user) {
            this._token.set(token);
            this._user.set(JSON.parse(user));
        }
    }

    login(username: string, password: string) {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
            tap((res) => {
                this._token.set(res.accessToken);
                this._user.set(res.user);
                localStorage.setItem('accessToken', res.accessToken);
                localStorage.setItem('refreshToken', res.refreshToken);
                localStorage.setItem('user', JSON.stringify(res.user));
            })
        );
    }

    refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            this.logout();
            return;
        }
        return this.http.post<{ accessToken: string; refreshToken: string }>(
            `${this.apiUrl}/refresh`,
            { refreshToken }
        ).pipe(
            tap((res) => {
                this._token.set(res.accessToken);
                localStorage.setItem('accessToken', res.accessToken);
                localStorage.setItem('refreshToken', res.refreshToken);
            })
        );
    }

    logout() {
        this._token.set(null);
        this._user.set(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    getToken() {
        return this._token();
    }

    hasRole(roles: string[]): boolean {
        const user = this._user();
        return user ? roles.includes(user.role) : false;
    }

    isAdmin(): boolean {
        return this.hasRole(['ADMIN']);
    }

    isManager(): boolean {
        return this.hasRole(['ADMIN', 'MANAGER']);
    }
}
