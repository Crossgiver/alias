import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, Routes} from '@angular/router';
import { MenuComponent } from "./components/menu/menu.component";
import {GameService} from "./services";
import {inject} from "@angular/core";

const canActivateGame: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(GameService).canActivate();
};

export const routes: Routes = [
  {
    path: 'menu',
    component: MenuComponent
  },
  {
    path: 'game',
    canActivate: [canActivateGame],
    loadChildren: () => import('./game-module/game.routes').then((m) => m.gameRoutes),
  },
  {
    path: '',
    redirectTo: '/menu',
    pathMatch: 'full'
  },
];
