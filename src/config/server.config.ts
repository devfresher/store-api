import debug from 'debug';
import { config } from 'dotenv';

config();

class ServerConfig {
  public NODE_ENV = process.env.NODE_ENV;

  public PORT = process.env.PORT;

  public DEBUG = this.NODE_ENV == 'development' ? debug('dev') : console.log;

  public ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;

  public AUTH_SECRET = process.env.AUTH_SECRET;

  public BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS);

  public ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;

  public DB_URI = process.env.DB_URI;
}

export default new ServerConfig();
