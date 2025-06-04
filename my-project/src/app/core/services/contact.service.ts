import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private http: HttpClient) { }

  sendMessage(formData: any): Observable<any> {
    // Use the defined API endpoint constant
    const url = API_ENDPOINTS.CONTACT.BASE; // Use the constant here
    return this.http.post(url, formData);
  }
} 