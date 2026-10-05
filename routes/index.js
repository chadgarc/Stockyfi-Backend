import { Router } from "express";
import authRoutes from "./auth.js";
import storeRoutes from "./stores.js";

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);

export default router;