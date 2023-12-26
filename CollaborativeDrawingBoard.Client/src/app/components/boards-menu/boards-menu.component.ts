import { Component, OnInit } from '@angular/core';
import { Board } from '../../models/board';
import { Router } from '@angular/router';
import { SignalrService } from '../../services/signalr.service';

@Component({
  selector: 'app-boards-menu',
  templateUrl: './boards-menu.component.html',
  styleUrls: ['./boards-menu.component.css'],
})
export class BoardsMenuComponent implements OnInit {
  public boards: Board[] = [];
  private username!: string;
  private signalrService!: SignalrService;

  constructor(private router: Router) {}
  ngOnInit() {
    this.signalrService = SignalrService.getInstance();
    this.signalrService.getConnectionInitialized().subscribe(() => {
      this.initSignalRListeners();
      this.getBoards();
    });
  }
  private initSignalRListeners() {
    this.signalrService.connection.on('newBoardAdded', (board: Board) => {
      this.boards.push(board);
    });

    this.signalrService.connection.on(
      'userJoinedBoard',
      (boardId: number, userName: string) => {
        const board = this.boards.find((b) => b.id === boardId);
        if (board) {
          board.users.push(userName);
        }
      }
    );

    this.signalrService.connection.on(
      'userLeftBoard',
      (boardId: number, userName: string) => {
        const board = this.boards.find((b) => b.id === boardId);
        if (board) {
          board.users = board.users.filter((u) => u !== userName);
        }
      }
    );
  }

  getBoards() {
    this.signalrService.getBoards().then((boards: Board[]) => {
      this.boards = boards;
    });
  }

  createBoard() {
    const boardName = prompt('Enter the name of the new board:');
    if (boardName) {
      this.signalrService.createBoard(boardName);
    }
  }

  joinBoard(boardId: number) {
    while (!this.username) {
      this.username = prompt('Enter the username:') || '';
    }

    this.signalrService.joinBoard(boardId, this.username).then(() => {
      this.router.navigate(['/board', boardId]);
    });
  }
}
