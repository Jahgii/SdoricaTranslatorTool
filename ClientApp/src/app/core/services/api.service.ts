import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

  public get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  public getWithHeaders<T>(endpoint: string, headers: { [key: string]: any }) {
    const HEADERS = new HttpHeaders(headers);

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers: HEADERS });
  }

  public post<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  public put<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  public putWithHeaders<T>(endpoint: string, headers: { [key: string]: any }, body: Object): Observable<T> {
    const HEADERS = new HttpHeaders(headers);

    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { headers: HEADERS });
  }

  public delete<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { body: body });
  }
}
