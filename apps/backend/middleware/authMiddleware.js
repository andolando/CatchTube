import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export const protect = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  req.user = session.user;
  req.session = session.session;

  next()
};
