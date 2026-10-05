import { Router } from "express";
import {setupOwner} from "../controllers/initialSetup.js";
import {login} from "../controllers/login.js";

const router = Router();

router.post('/setup', setupOwner);
router.post('/login', login);

export default router;