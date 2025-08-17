import { Router } from 'express';
import { createCheckoutSession } from '../controllers/checkout.controller.js';

const router = Router();

router.post('/create-session', createCheckoutSession);

export default router;