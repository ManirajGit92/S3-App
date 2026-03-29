import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://localhost:5073/api';
  private http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  // Auth
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }
  
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  socialLogin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/social-login`, data);
  }

  // Webpage
  getDefaultWebpage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/webpage/default?t=${new Date().getTime()}`);
  }

  // ChatBot Endpoints
  getFAQs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat/faqs`);
  }

  sendChatMessage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/message`, data);
  }

  getChatHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat/history`, { headers: this.getHeaders() });
  }

  manageFAQ(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat/faqs`, data, { headers: this.getHeaders() });
  }

  deleteFAQ(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/chat/faqs/${id}`, { headers: this.getHeaders() });
  }

  uploadImage(file: File): Observable<{ url: string }> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    // No Content-Type header — browser sets multipart boundary automatically
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/image`, formData, { headers });
  }

  // Security Endpoints
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/profile`, data, { headers: this.getHeaders() });
  }

  getMyWebpage(): Observable<any> {
    return this.http.get(`${this.apiUrl}/webpage/my`, { headers: this.getHeaders() });
  }

  updateMyWebpage(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/webpage/my`, data, { headers: this.getHeaders() });
  }

  getPublicWebpage(uniqueId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/webpage/public/${uniqueId}`);
  }

  // Products
  getProducts(webpageId: number, search: string = '', sort: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}/product/webpage/${webpageId}?search=${search}&sort=${sort}`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product`, data, { headers: this.getHeaders() });
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/product/${id}`, data, { headers: this.getHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/product/${id}`, { headers: this.getHeaders() });
  }

  buyProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/product/buy`, data);
  }

  // Analytics
  getAnalyticsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/summary`, { headers: this.getHeaders() });
  }

  getAnalyticsCharts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/charts`, { headers: this.getHeaders() });
  }
}
