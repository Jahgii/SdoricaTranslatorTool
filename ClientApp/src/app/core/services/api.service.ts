import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = new BehaviorSubject('');

  constructor(
    private http: HttpClient,
    private lStorage: LocalStorageService
  ) { this.initApi(); }

  private initApi() {
    let baseUrl = this.lStorage.getAppApiUrl();

    if (baseUrl) this.baseUrl.next(baseUrl);
  }

  public setBaseUrl(url: string) {
    this.baseUrl.next(url);
  }

  public get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl.value}api/${endpoint}`);
  }

  public getWithHeaders<T>(endpoint: string, headers: { [key: string]: any }) {
    const HEADERS = new HttpHeaders(headers);

    return this.http.get<T>(`${this.baseUrl.value}api/${endpoint}`, { headers: HEADERS });
  }

  public post<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl.value}api/${endpoint}`, body);
  }

  public put<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl.value}api/${endpoint}`, body);
  }

  public putWithHeaders<T>(endpoint: string, headers: { [key: string]: any }, body: Object): Observable<T> {
    const HEADERS = new HttpHeaders(headers);

    return this.http.put<T>(`${this.baseUrl.value}api/${endpoint}`, body, { headers: HEADERS });
  }

  public delete<T>(endpoint: string, body: Object): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl.value}api/${endpoint}`, { body: body });
  }
}
