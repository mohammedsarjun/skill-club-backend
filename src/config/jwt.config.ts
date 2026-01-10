export const jwtConfig = {
  accessTokenMaxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE) || 900, // 15 min
  refreshTokenMaxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE) || 604800, // 7 days
};
