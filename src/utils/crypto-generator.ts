import crypto from 'crypto';
export async function genRandom() {
  const token = crypto.randomBytes(32).toString('hex'); // or use JWT with expiry
  const expiry = Date.now() + 3600000; // 1 hour

  return { token: token, expiry: expiry };
}
