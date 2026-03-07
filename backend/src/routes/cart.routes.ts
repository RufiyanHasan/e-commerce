import { Router } from 'express';
import { getCart, upsertCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // all cart routes require login

router.get('/', getCart);
router.put('/', upsertCartItem);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
