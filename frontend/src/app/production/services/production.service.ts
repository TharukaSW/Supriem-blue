import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private apiUrl = `${environment.apiUrl}/production`;

  constructor(private http: HttpClient) { }

  getProduction(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<any>(this.apiUrl, { params: httpParams });
  }

  getProductionById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createProduction(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateProduction(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  closeDay(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/close`, {});
  }

  reopenDay(id: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reopen`, { reason });
  }
}
