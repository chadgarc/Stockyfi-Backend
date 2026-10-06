import { Router } from "express";
import authRoutes from "./auth.js";
import storeRoutes from "./storesRoute.js";
import businessRoutes from "./businessRoute.js";
import usersRoutes from "./users.js";

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/info', businessRoutes);
router.use('/users', usersRoutes);

export default router;