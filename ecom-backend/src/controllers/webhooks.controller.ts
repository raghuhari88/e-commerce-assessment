import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { Orders } from '../services/orders.service.js';

export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') return res.sendStatus(400);

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    await Orders.recordFromCheckoutSession(session);
  }

  res.json({ received: true });
}
