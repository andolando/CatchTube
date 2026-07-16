import { Router } from "express";
import { searchChannels} from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/channels", protect, searchChannels);

export default router;