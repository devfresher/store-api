import loggerUtil from '@src/utils/logger.util';
import debug from 'debug';
import { config } from 'dotenv';
import Joi from 'joi';

config();

class ServerConfig {
  public NODE_ENV!: string;
  public PORT!: number;
  public DEBUG!: (...args: any[]) => void;
  public ALLOWED_ORIGINS?: string;
  public AUTH_SECRET!: string;
  public BCRYPT_SALT_ROUNDS!: number;
  public JWT_ACCESS_EXPIRES_IN!: string;
  public DB_URI!: string;
  public TOTP_SECRET_KEY!: string;

  private envSchema = Joi.object<ServerConfig>({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
    PORT: Joi.number().default(3000),
    DB_URI: Joi.string().required(),
    AUTH_SECRET: Joi.string().required(),
    BCRYPT_SALT_ROUNDS: Joi.number().default(10),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('1h'),
    ALLOWED_ORIGINS: Joi.string().optional(),
    TOTP_SECRET_KEY: Joi.string().required(),
  }).unknown();

  constructor() {
    this.validate();
    this.setDebug();
  }

  /**
   * Validates the environment variables against the schema.
   *
   * It throws an error if the validation fails.
   *
   * @throws {Error} If the validation fails.
   */
  private validate() {
    const { error, value: envVars } = this.envSchema.validate(process.env, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(
        `Config validation error: ${error.details.map((err) => err.message).join(', ')}`
      );
    }

    Object.assign(this, envVars);
  }

  /**
   * Sets the DEBUG property based on the NODE_ENV.
   *
   * If NODE_ENV is 'development', it uses the 'debug' package to log messages.
   * Otherwise, it uses the loggerUtil.log function.
   *
   * @private
   */
  private setDebug() {
    this.DEBUG = this.NODE_ENV === 'development' ? debug('dev') : loggerUtil.log;
  }
}

export default new ServerConfig();
