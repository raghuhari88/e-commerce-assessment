import { Router } from 'express';
import productsRouter from './products.routes.js';
import checkoutRouter from './checkout.routes.js';
import webhooksRouter from './webhooks.routes.js';

const router = Router();

router.use('/products', productsRouter);
router.use('/checkout', checkoutRouter);
router.use('/webhooks', webhooksRouter);

export default router;