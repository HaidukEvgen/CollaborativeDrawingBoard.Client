import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DrawingBoardComponent } from './components/drawing-board/drawing-board.component';

const routes: Routes = [
  { path: 'board/:id', component: DrawingBoardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
