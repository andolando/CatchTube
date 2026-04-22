export const protect = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    error: 'Non authentifié',
    message: 'Vous devez être connecté pour accéder à cette ressource',
  });
};
