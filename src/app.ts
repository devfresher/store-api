import express, { Application, json, urlencoded } from 'express';
import { Connection } from 'mongoose';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'http';
import DB from '@src/db';
import routes from '@src/routes';
import serverConfig from '@src/config/server.config';
import systemMiddleware from '@src/middleware/system.middleware';
import loggerUtil from './utils/logger.util';

class App {
  protected server!: Server;
  protected dbConnection!: Connection;
  protected corsOptions: cors.CorsOptions;

  constructor(public app: Application) {
    this.corsOptions = {
      origin: serverConfig.ALLOWED_ORIGINS
        ? serverConfig.ALLOWED_ORIGINS.split(',')
        : '*',
    };

    this.initializeDb();
    this.initializeMiddlewaresAndRoutes();

    const signals = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async (error) => {
        loggerUtil.log(
          'error',
          `Received signal (${signal}) to terminate the application ${error}`
        );
        await this.close();
      });
    });
  }

  private async initializeDb(): Promise<void> {
    try {
      this.dbConnection = await DB.connectDB(serverConfig.DB_URI);
      loggerUtil.debug('MongoDB connection established');
    } catch (error) {
      loggerUtil.log('error', `Error connecting to MongoDB: ${error}`);
    }
  }

  private initializeMiddlewaresAndRoutes(): void {
    this.app.set('trust proxy', 1);
    this.app.use(compression());

    if (serverConfig.NODE_ENV === 'development') {
      this.app.use(cors());
    } else {
      this.app.use(cors(this.corsOptions));
    }

    this.app.use(json());
    this.app.use(urlencoded({ extended: false }));
    this.app.use(helmet());

    if (['development', 'staging'].includes(serverConfig.NODE_ENV)) {
      this.app.use(morgan('dev'));
    }

    this.setupRoutes();
    this.setupErrorHandlingMiddleware();
  }

  private setupRoutes(): void {
    this.app.use(routes);
  }

  /**
   * Sets up the error handling middleware by adding the errorHandler middleware to the app.
   * The errorHandler middleware is responsible for catching and handling all errors that occur
   * in the application, such as route not found errors, validation errors, and unknown errors.
   * It will log the error and return a JSON response with the error message and code.
   */
  private setupErrorHandlingMiddleware(): void {
    this.app.use(systemMiddleware.errorHandler());
  }

  /**
   * Closes the application by closing the http server and the MongoDB connection.
   * @returns a promise that resolves when the application is closed
   */
  private async close(): Promise<void> {
    try {
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server?.close(() => {
            loggerUtil.debug('Http server closed');
            resolve();
          });
        });
      }

      await DB.closeConnection();

      loggerUtil.debug('Shutdown completed successfully\n');
    } catch (error) {
      loggerUtil.log('error', `Error during shutdown: ${error}`);
    } finally {
      process.exit(0);
    }
  }

  /**
   * Starts the express application server on the specified port.
   *
   * @returns The express server instance.
   */
  public start(): Server {
    this.server = this.app.listen(process.env.PORT, () => {
      loggerUtil.debug(
        `Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
      );
    });

    return this.server;
  }
}

const app = new App(express());
const server = app.start();
export default server;
