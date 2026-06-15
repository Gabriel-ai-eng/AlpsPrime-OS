import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns the total count of users on the platform.
 * Used for display purposes (e.g., "Join 1,234 users")
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Count all users
    const users = await base44.asServiceRole.entities.User.list();
    const totalUsers = users?.length || 0;

    return Response.json({ count: totalUsers });
  } catch (error) {
    console.error('getUsersCount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
