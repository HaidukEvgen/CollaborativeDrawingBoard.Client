import * as signalR from '@microsoft/signalr';
import { Point } from '../models/point';
import { Observable, Subject } from 'rxjs';
import { Board } from '../models/board';

export class SignalrService {
  private static instance: SignalrService;
  public connection: signalR.HubConnection;
  private connectionInitializedSubject = new Subject<void>();
  private newBoardAddedSubject = new Subject<Board>();
  private userJoinedBoardSubject = new Subject<{
    boardId: number;
    userName: string;
  }>();
  private userLeftBoardSubject = new Subject<{
    boardId: number;
    userName: string;
  }>();
  private newStrokeSubject = new Subject<any>();

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5071/drawHub')
      .build();

    this.connection.on('newBoardAdded', (board: Board) => {
      this.newBoardAddedSubject.next(board);
    });

    this.connection.on(
      'userJoinedBoard',
      (boardId: number, userName: string) => {
        this.userJoinedBoardSubject.next({ boardId, userName });
      }
    );

    this.connection.on('userLeftBoard', (boardId: number, userName: string) => {
      this.userLeftBoardSubject.next({ boardId, userName });
    });

    this.connection.on('newStroke', (data: any) => {
      this.newStrokeSubject.next(data);
    });

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

  isConnected() {
    return this.connection.state === signalR.HubConnectionState.Connected;
  }

  getConnectionInitialized(): Observable<void> {
    return this.connectionInitializedSubject.asObservable();
  }

  getNewBoardAdded(): Observable<Board> {
    return this.newBoardAddedSubject.asObservable();
  }

  getUserJoinedBoard(): Observable<{ boardId: number; userName: string }> {
    return this.userJoinedBoardSubject.asObservable();
  }

  getUserLeftBoard(): Observable<{ boardId: number; userName: string }> {
    return this.userLeftBoardSubject.asObservable();
  }

  getNewStroke(): Observable<any> {
    return this.newStrokeSubject.asObservable();
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
