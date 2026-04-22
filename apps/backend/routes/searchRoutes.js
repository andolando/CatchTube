import { Router } from "express";
import { searchChannels} from "../controllers/searchController.js";

const router = Router();

router.post("/channels", searchChannels);

export default router;