import mongoose, { ConnectOptions, Connection } from 'mongoose';
import serverConfig from '@src/config/server.config';
import loggerUtil from '@src/utils/logger.util';

class DB {
  private options: ConnectOptions;
  public connection!: Connection;

  constructor() {
    this.options = {
      autoIndex: serverConfig.NODE_ENV === 'development',
    };
  }

  public async connectDB(dbUri: string) {
    mongoose.set('strictQuery', false);
    const { connection } = await mongoose.connect(dbUri, this.options);
    this.connection = connection;

    this.connection.on('disconnected', () => {
      loggerUtil.debug('MongoDB connection closed');
    });

    return this.connection;
  }

  public async closeConnection() {
    if (this.connection) await this.connection.close();
  }
}

export default new DB();
