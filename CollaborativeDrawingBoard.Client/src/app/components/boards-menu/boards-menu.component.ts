import { Component, OnInit } from '@angular/core';
import { Board } from '../../models/board';
import { Router } from '@angular/router';
import { SignalrService } from '../../services/signalr.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-boards-menu',
  templateUrl: './boards-menu.component.html',
  styleUrls: ['./boards-menu.component.css'],
})
export class BoardsMenuComponent implements OnInit {
  public boards: Board[] = [];
  private username!: string;
  private signalrService!: SignalrService;

  constructor(private router: Router, private cookieService: CookieService) {}
  ngOnInit() {
    this.signalrService = SignalrService.getInstance();
    if (this.signalrService.isConnected()) {
      this.initSignalRListeners();
      this.getBoards();
    } else {
      this.signalrService.getConnectionInitialized().subscribe(() => {
        this.initSignalRListeners();
        this.getBoards();
      });
    }
  }

  private initSignalRListeners() {
    this.signalrService.getNewBoardAdded().subscribe((board: Board) => {
      this.boards.push(board);
    });

    this.signalrService
      .getUserJoinedBoard()
      .subscribe(({ boardId, userName }) => {
        const board = this.boards.find((b) => b.id === boardId);
        if (board) {
          board.usernames.push(userName);
        }
      });

    this.signalrService
      .getUserLeftBoard()
      .subscribe(({ boardId, userName }) => {
        const board = this.boards.find((b) => b.id === boardId);
        if (board) {
          board.usernames = board.usernames.filter((u) => u !== userName);
        }
      });
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
    const username = this.cookieService.get('username');

    if (!username) {
      this.username = prompt('Enter the username:') || '';
      this.cookieService.set('username', this.username);
    } else {
      this.username = username;
    }

    this.signalrService.joinBoard(boardId, this.username).then(() => {
      this.router.navigate(['/board', boardId]);
    });
  }
}
