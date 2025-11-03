export enum EnvEnum {
  /** JWT secret key for token signing */
  JWT__SECRET = 'JWT__SECRET',

  /** JWT token expiration time (e.g., '1h', '24h', '7d') */
  JWT__EXPIRES_IN = 'JWT__EXPIRES_IN',

  /** JWT refresh token expiration time */
  JWT__REFRESH_EXPIRES_IN = 'JWT__REFRESH_EXPIRES_IN',
}
