import {
  ConnectionService,
  DecoderService,
  EventService,
  FormService,
  HelperService,
  StageService,
  AdminService,
  // MultitokenService,
  // PendingService,
  // TokenService,
  // DividendService,
  // UIService,
} from './core';
import { IsaoService } from './core/isao.service';

export const APP_PROVIDERS = [
  ConnectionService,
  DecoderService,
  EventService,
  FormService,
  HelperService,
  StageService,
  AdminService,
  IsaoService,
  // TokenService,
  // MultitokenService,
  // DividendService,
  // PendingService,
  // UIService,
];
