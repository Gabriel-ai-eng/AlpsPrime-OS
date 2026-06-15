import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Unlock a premium post. The buyer pays from their goal-rewards balance
 * (computed from completed Challenges minus existing Withdrawals and prior content_spent_brl).
 * On success: increments creator's content_sales_brl, updates buyer's content_spent_brl,
 * bumps post's unlock_count and premium_revenue_brl, and creates a PostUnlock record.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { post_id } = await req.json().catch(() => ({}));
    if (!post_id) return Response.json({ error: 'post_id required' }, { status: 400 });

    // Fetch post
    const post = await svc.entities.Post.get(post_id).catch(() => null);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });
    if (!post.is_premium || !post.premium_price || post.premium_price <= 0) {
      return Response.json({ error: 'Post is not premium' }, { status: 400 });
    }
    if (post.author_email === me.email) {
      return Response.json({ error: "You can't unlock your own post" }, { status: 400 });
    }

    // Already unlocked?
    const existing = await svc.entities.PostUnlock.filter({ post_id, buyer_email: me.email }, '-created_date', 1);
    if (existing.length > 0) {
      return Response.json({ ok: true, already_unlocked: true });
    }

    const price = Number(post.premium_price);

    // Compute buyer's available balance:
    // (completed challenges × R$1) − (withdrawals already processed/pending) − (content already spent)
    const [completions, withdrawals] = await Promise.all([
      svc.entities.Challenge.filter({ user_email: me.email }, '-created_date', 500),
      svc.entities.Withdrawal.filter({ user_email: me.email }, '-created_date', 500),
    ]);
    const earned = completions.length * 1; // R$1 per goal completed
    const withdrawn = withdrawals
      .filter((w) => ['paid', 'pending', 'processing'].includes(w.status))
      .reduce((s, w) => s + (Number(w.amount) || 0), 0);
    const alreadySpent = Number(me.content_spent_brl || 0);
    const balance = Math.max(0, earned - withdrawn - alreadySpent);

    if (balance < price) {
      return Response.json({
        error: 'insufficient_balance',
        balance,
        price,
        message: `Saldo insuficiente. Você tem R$ ${balance.toFixed(2)} e o post custa R$ ${price.toFixed(2)}.`,
      }, { status: 402 });
    }

    // Record the unlock
    await svc.entities.PostUnlock.create({
      post_id,
      buyer_email: me.email,
      creator_email: post.author_email,
      amount_brl: price,
    });

    // Update buyer (debit)
    await base44.auth.updateMe({ content_spent_brl: alreadySpent + price });

    // Update creator (credit) — service role
    const creatorList = await svc.entities.User.filter({ email: post.author_email }, '-created_date', 1);
    const creator = creatorList[0];
    if (creator) {
      const currentSales = Number(creator.content_sales_brl || 0);
      await svc.entities.User.update(creator.id, { content_sales_brl: currentSales + price });
    }

    // Update post counters
    await svc.entities.Post.update(post_id, {
      unlock_count: Number(post.unlock_count || 0) + 1,
      premium_revenue_brl: Number(post.premium_revenue_brl || 0) + price,
    });

    // Notify creator
    await svc.entities.Notification.create({
      recipient_email: post.author_email,
      actor_email: me.email,
      actor_name: me.full_name || me.email,
      actor_avatar: me.profile_picture_url || '',
      type: 'like',
      post_id,
      post_preview: `💎 Desbloqueou seu conteúdo premium por R$ ${price.toFixed(2).replace('.', ',')}`,
    });

    return Response.json({ ok: true, unlocked: true, new_balance: balance - price });
  } catch (error) {
    console.error('unlockPremiumPost error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});