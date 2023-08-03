import { HttpClient } from '@angular/common/http';
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

  public post<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }
}
