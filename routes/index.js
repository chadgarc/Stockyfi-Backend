import { Router } from "express";
import authRoutes from "./auth.js";
import storeRoutes from "./storesRoute.js";
import businessRoutes from "./businessRoute.js";

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/info', businessRoutes);

export default router;