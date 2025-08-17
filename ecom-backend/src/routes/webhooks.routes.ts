import { Router } from 'express';
import { stripeWebhook } from '../controllers/webhooks.controller.js';

const router = Router();

// Stripe needs the raw body; we mount a raw parser just for this route
import express from 'express';
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;