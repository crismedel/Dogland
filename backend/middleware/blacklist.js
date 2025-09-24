const blacklistedTokens = new Set();

export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

export const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};