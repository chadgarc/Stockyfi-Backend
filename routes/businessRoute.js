import { Router } from "express";
import { getBusiness, updateBusiness } from "../controllers/businessController.js";

const router = Router();

router.get('/', getBusiness);
router.put('/', updateBusiness);

export default router;