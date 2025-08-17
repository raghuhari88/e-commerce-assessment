import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { getProductsByIds } from '../services/products.service.js';

export async function createCheckoutSession(req: Request, res: Response) {
 
  const { items, customer_email } = req.body as {
    items: { id: string; quantity: number }[];
    customer_email?: string;
  };
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items required' });
  }

  const products = await getProductsByIds(items.map((i) => i.id));
  
  const line_items = items.map((i) => {
    const p = products.find((x) => x.id === i.id);
    if (!p) throw new Error(`Product ${i.id} not found`);
    return {
      price_data: {
        currency: 'usd',
        product_data: { name: p.name, images: p.image_url ? [p.image_url] : [] },
        unit_amount: Math.round(Number(p.price) * 100),
      },
      quantity: i.quantity,
    } as const;
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items,
    success_url: `${process.env.PUBLIC_URL}/success`, //?session_id={CHECKOUT_SESSION_ID}
    cancel_url: `${process.env.PUBLIC_URL}/cancel`,
    customer_email,
  });

 

  res.json({ id: session.id, url: session.url });
}
