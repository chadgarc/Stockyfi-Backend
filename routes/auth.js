import { Router } from "express";
import { setupOwner } from "../controllers/initialSetup.js";
import { login } from "../controllers/login.js";
import { register } from "../controllers/register.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post('/setup', setupOwner);
router.post('/login', login);
router.post('/register', protect, register);

export default router;