import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Point } from '../models/point';
import { Observable, Subject } from 'rxjs';
import { Board } from '../models/board';

export class SignalrService {
  private static instance: SignalrService;
  public connection: signalR.HubConnection;
  private connectionInitializedSubject = new Subject<void>();

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5071/drawHub')
      .build();
    this.connection.start().then(() => {
      this.connectionInitializedSubject.next();
    });
  }

  static getInstance(): SignalrService {
    if (!SignalrService.instance) {
      SignalrService.instance = new SignalrService();
    }
    return SignalrService.instance;
  }

  getConnectionInitialized(): Observable<void> {
    return this.connectionInitializedSubject.asObservable();
  }

  public AddStroke(
    drawingBoardId: number,
    startPoint: Point,
    endPoint: Point,
    color: string
  ) {
    this.connection.invoke(
      'AddStroke',
      drawingBoardId,
      startPoint,
      endPoint,
      color
    );
  }

  getBoards(): Promise<Board[]> {
    return new Promise<Board[]>((resolve) => {
      this.connection.invoke('GetBoards').then((boards: Board[]) => {
        resolve(boards);
      });
    });
  }

  createBoard(boardName: string) {
    this.connection.invoke('CreateBoard', boardName);
  }

  joinBoard(boardId: number, username: string): Promise<void> {
    return this.connection.invoke('JoinBoard', boardId, username);
  }

  leaveBoard(boardId: number, username: string): Promise<void> {
    return this.connection.invoke('LeaveBoard', boardId, username);
  }
}
