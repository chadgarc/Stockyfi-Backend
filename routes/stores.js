import { Router } from "express";
import { createStore } from "../controllers/store.js";
import { protect } from "../middleware/auth.js";
import { getStores } from "../controllers/store.js";

const router = Router();

router.post('/', protect, createStore);
router.get('/', protect, getStores);

export default router;