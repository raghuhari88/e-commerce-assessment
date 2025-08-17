import db from '../config/db.js';

export const Orders = {
  async recordFromCheckoutSession(session: any) {
    const total = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency || 'usd';
    const email = session.customer_details?.email || session.customer_email || null;

    // In a real app, store line items via Stripe API call; here we store the session basics
    const [order] = await db('orders')
      .insert({ stripe_session_id: session.id, status: 'paid', total_amount: total, currency, customer_email: email })
      .returning('*');

    return order;
  },
};
