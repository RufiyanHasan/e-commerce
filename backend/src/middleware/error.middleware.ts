import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // four-argument signature required by Express to treat this as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isProd = process.env['NODE_ENV'] === 'production';
  console.error(err);
  res.status(500).json({
    message: isProd ? 'Internal server error.' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}
