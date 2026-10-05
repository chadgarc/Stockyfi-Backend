import { Router } from "express";
import {setupOwner} from "../../controllers/initialSetup.js";

const router = Router();

router.post('/setup', setupOwner);

export default router;