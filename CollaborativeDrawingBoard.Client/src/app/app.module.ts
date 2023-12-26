import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DrawingBoardComponent } from './components/drawing-board/drawing-board.component';
import { BoardsMenuComponent } from './components/boards-menu/boards-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawingBoardComponent,
    BoardsMenuComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
