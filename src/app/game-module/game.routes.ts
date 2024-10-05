import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, Routes} from "@angular/router";
import {inject} from "@angular/core";
import {GameService} from "../services";

const isWinnerNotExists: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(GameService).isWinnerNotExist();
};

export const gameRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/game').then(c => c.GameComponent),
    canActivate: [isWinnerNotExists],
  },
  {
    path: 'ready',
    loadComponent: () => import('./components/ready-to-go').then(c => c.ReadyToGoComponent),
    canActivate: [isWinnerNotExists],
  },
  {
    path: 'team-statistics/:teamId',
    loadComponent: () => import('./components/team-statistics').then(c => c.TeamStatisticsComponent),
    canActivate: [isWinnerNotExists],
  },
  {
    path: 'winner-is',
    loadComponent: () => import('./components/winner-is').then(c => c.WinnerIsComponent),
  },
];
