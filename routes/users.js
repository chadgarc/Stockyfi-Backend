import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { isOwner } from "../utils/roles.js";
import {
    getMe,
    updateMe,
    getUser,
    getUsers,
    updateUser,
    deleteUser,
    createOwner,
} from "../controllers/userController.js";

const router = Router();

// Own profile first (order matters: /me before /:id, /owners before /:id)
const requireOwner = (req, res, next) => {
    if (!isOwner(req.user)) return res.status(403).json({ message: 'Owner only' });
    next();
};

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Owner-admin owners endpoint
router.post('/owners', protect, requireOwner, createOwner);
router.put('/owners/:userId', protect, requireOwner, updateUser);
router.delete('/owners/:userId', protect, requireOwner, deleteUser);

// General staff (owner|manager via controller guards)
router.get('/', protect, getUsers);
router.get('/:userId', protect, getUser);
router.put('/:userId', protect, updateUser);
router.delete('/:userId', protect, deleteUser);

export default router;
