import { verifyToken } from '../utils/jwt.js';

export function authenticateJWT(req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}
	const decoded = verifyToken(token);
	if (!decoded) {
		return res.status(403).json({ message: 'Invalid or expired token' });
	}
	req.user = decoded;
	next();
}

// Optional version: sets req.user when valid, otherwise continues without blocking
export function optionalAuthenticateJWT(req, _res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  const decoded = verifyToken(token);
  if (decoded) {
    req.user = decoded;
  }
  next();
}

// Require an authenticated admin user (role === 'admin')
export function requireAdmin(req, res, next) {
	// First ensure token is valid and req.user is populated
	authenticateJWT(req, res, function authNext(err) {
		if (err) return next(err);
		// authenticateJWT either sent a response on failure or set req.user
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Admin privileges required' });
		}
		return next();
	});
}
