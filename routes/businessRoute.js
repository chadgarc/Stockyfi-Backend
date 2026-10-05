import { Router } from "express";
import { getBusiness, updateBusiness } from "../controllers/businessController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get('/', protect, getBusiness);
router.put('/', protect, updateBusiness);

export default router;