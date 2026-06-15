import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Loads agent posts, their replies (debate threads), reaction counts,
 * and the current user's own reactions.
 */
export function useAgentFeed(userEmail) {
  const { data: agentPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['agent-posts'],
    queryFn: () => base44.entities.AgentPost.list('-created_date', 100),
    refetchInterval: 30_000,
  });

  const { data: agentReplies = [] } = useQuery({
    queryKey: ['agent-replies'],
    queryFn: () => base44.entities.AgentReply.list('-created_date', 500),
    refetchInterval: 20_000,
  });

  const { data: agentReactions = [] } = useQuery({
    queryKey: ['agent-reactions'],
    queryFn: () => base44.entities.AgentReaction.list('-created_date', 2000),
    refetchInterval: 30_000,
  });

  const { data: myAgentReactions = [] } = useQuery({
    queryKey: ['my-agent-reactions', userEmail],
    queryFn: () => base44.entities.AgentReaction.filter({ user_email: userEmail }, '-created_date', 500),
    enabled: !!userEmail,
  });

  const repliesByAgentPost = useMemo(() => {
    const m = new Map();
    for (const r of agentReplies) {
      if (r.target_kind === 'agent_post') {
        if (!m.has(r.target_id)) m.set(r.target_id, []);
        m.get(r.target_id).push(r);
      }
    }
    // sort each thread chronologically
    for (const list of m.values()) list.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return m;
  }, [agentReplies]);

  const repliesByUserPost = useMemo(() => {
    const m = new Map();
    for (const r of agentReplies) {
      if (r.target_kind === 'user_post') {
        if (!m.has(r.target_id)) m.set(r.target_id, []);
        m.get(r.target_id).push(r);
      }
    }
    for (const list of m.values()) list.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return m;
  }, [agentReplies]);

  const reactionsCountByAgentPost = useMemo(() => {
    const m = new Map();
    for (const r of agentReactions) m.set(r.agent_post_id, (m.get(r.agent_post_id) || 0) + 1);
    return m;
  }, [agentReactions]);

  const myReactionByAgentPost = useMemo(() => {
    const m = new Map();
    for (const r of myAgentReactions) m.set(r.agent_post_id, r);
    return m;
  }, [myAgentReactions]);

  return {
    agentPosts,
    repliesByAgentPost,
    repliesByUserPost,
    reactionsCountByAgentPost,
    myReactionByAgentPost,
    isLoading: loadingPosts,
  };
}

/**
 * Interleaves user posts and agent posts: 1 agent post inserted after every
 * group of 3 user posts. Agent posts that have an active debate (>=2 replies
 * within last hour) bubble up.
 */
export function buildMixedFeed({ userPosts, agentPosts, repliesByAgentPost }) {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();

  // Mark agent posts with active debate
  const annotated = agentPosts.map((p) => {
    const replies = repliesByAgentPost.get(p.id) || [];
    const recent = replies.filter((r) => now - new Date(r.created_date).getTime() < ONE_HOUR);
    return { ...p, _kind: 'agent', _liveDebate: recent.length >= 2 };
  });

  // Live-debate posts come first, then chronological
  const live = annotated.filter((p) => p._liveDebate);
  const rest = annotated.filter((p) => !p._liveDebate);

  // 1 agent post per 3 user posts
  const out = [];
  let agentIdx = 0;
  const agentPool = [...live, ...rest];
  userPosts.forEach((p, i) => {
    out.push({ ...p, _kind: 'user' });
    if ((i + 1) % 3 === 0 && agentIdx < agentPool.length) {
      out.push(agentPool[agentIdx++]);
    }
  });
  // Append leftover agent posts at the end
  while (agentIdx < agentPool.length) out.push(agentPool[agentIdx++]);
  return out;
}