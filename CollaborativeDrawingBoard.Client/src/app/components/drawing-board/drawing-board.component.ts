import { Component } from '@angular/core';
import { SignalrService } from '../../services/signalr.service';
import { Point } from '../../models/point';
import { CookieService } from 'ngx-cookie-service';
import { BoardService } from '../../services/board.service';
import { Stroke } from '../../models/stroke';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-drawing-board',
  templateUrl: './drawing-board.component.html',
  styleUrl: './drawing-board.component.css',
})
export class DrawingBoardComponent {
  boardName: string = '';
  boardId!: number;
  color: string = 'black';
  canvas!: HTMLCanvasElement;
  context!: CanvasRenderingContext2D;
  lastX!: number;
  lastY!: number;
  private signalrService!: SignalrService;

  constructor(
    private boardService: BoardService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService
  ) {
    this.route.params.subscribe((params) => {
      this.boardId = +params.id;
    });
  }

  ngOnInit() {
    this.signalrService = SignalrService.getInstance();
    this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.setupCanvas();
    this.initSignalRListeners();
  }

  private initSignalRListeners() {
    this.signalrService.getNewStroke().subscribe((data: any) => {
      this.newStrokeReceived(data);
    });
  }

  ngAfterViewInit(): void {
    this.fillBoard();
  }

  fillBoard() {
    this.boardService.getStrokes(this.boardId).subscribe((strokes) => {
      this.drawStrokes(strokes);
    });
  }

  drawStrokes(strokes: Stroke[]) {
    strokes.forEach((stroke) => {
      this.context.strokeStyle = stroke.color;
      this.context.beginPath();
      this.context.moveTo(stroke.startPointX, stroke.startPointY);
      this.context.lineTo(stroke.endPointX, stroke.endPointY);
      this.context.stroke();
    });
  }

  setupCanvas() {
    this.canvas.width = window.outerWidth;
    this.canvas.height = window.outerHeight;
    this.context.strokeStyle = 'black';

    this.fillBoard();

    this.canvas.addEventListener('mousedown', (event) => {
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.context.beginPath();
      this.context.moveTo(event.offsetX, event.offsetY);
      this.canvas.addEventListener('mousemove', this.onMouseMove);
    });

    this.canvas.addEventListener('mouseup', () => {
      this.canvas.removeEventListener('mousemove', this.onMouseMove);
    });
  }

  newStrokeReceived(data: any) {
    const startPoint: Point = { X: data.startPoint.x, Y: data.startPoint.y };
    const endPoint: Point = { X: data.endPoint.x, Y: data.endPoint.y };
    this.drawPointToPoint(startPoint, endPoint, data.color);
  }

  drawPointToPoint(startPoint: Point, endPoint: Point, color: string) {
    this.context.strokeStyle = color;
    this.context.moveTo(startPoint.X, startPoint.Y);
    this.context.lineTo(endPoint.X, endPoint.Y);
    this.context.stroke();
  }

  draw(x: number, y: number) {
    this.context.strokeStyle = this.color;
    this.context.lineTo(x, y);
    this.context.stroke();

    const startPoint: Point = { X: this.lastX, Y: this.lastY };
    const endPoint: Point = { X: x, Y: y };
    this.signalrService.AddStroke(
      this.boardId,
      startPoint,
      endPoint,
      this.color
    );

    this.lastX = x;
    this.lastY = y;
  }

  onMouseMove = (event: MouseEvent) => {
    this.draw(event.offsetX, event.offsetY);
  };

  goBackToMenu() {
    const username = this.cookieService.get('username');
    this.signalrService.leaveBoard(this.boardId, username);
    this.router.navigate(['']);
  }
}
