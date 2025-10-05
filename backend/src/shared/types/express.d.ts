import { AppLocals } from './handler.types';

declare global {
  namespace Express {
    interface Locals extends AppLocals {}
  }
}

export {};
