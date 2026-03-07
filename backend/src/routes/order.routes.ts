import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

router.use(authenticate); // all order routes require login

router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

// Admin only
router.get('/admin/all', requireAdmin, getAllOrders);
router.patch('/admin/:id/status', requireAdmin, updateOrderStatus);

export default router;
