import { Request } from 'express';

export interface SigninRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}
