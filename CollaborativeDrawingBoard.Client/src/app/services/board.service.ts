import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stroke } from '../models/stroke';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  apiUrl: string = 'http://localhost:5071';

  constructor(private http: HttpClient) {}

  getStrokes(boardId: number): Observable<Stroke[]> {
    return this.http.get<any>(
      `${this.apiUrl}/drawingboards/${boardId}/strokes`
    ).pipe(
      map(response => response.$values)
    );
  }
}
