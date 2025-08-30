import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Position {
  id?: number;
  level: string;
  postNumber: string;
  title: string;
  defaultJobTitle: string;
  userJobTitle: string;
  titleCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PositionsService {
  private apiUrl = 'http://localhost:3000/positions';

  constructor(private http: HttpClient) {}

  getPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(this.apiUrl);
  }

  addPosition(position: Position): Observable<Position> {
    return this.http.post<Position>(this.apiUrl, position);
  }

  updatePosition(id: number, position: Position): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/${id}`, position);
  }

  deletePosition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
