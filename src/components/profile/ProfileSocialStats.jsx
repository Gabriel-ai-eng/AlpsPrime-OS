import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import FollowListModal from './FollowListModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { createNotification } from '@/lib/notifications';

/**
 * Shows follower / following counts and a Follow/Unfollow button
 * when the viewer is looking at someone else's profile.
 *
 * Props:
 *   profileEmail: email of the profile being viewed
 *   currentUserEmail: email of the viewer (can be the same as profileEmail = own profile)
 */
export default function ProfileSocialStats({ profileEmail, currentUserEmail }) {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [list, setList] = useState(null); // 'followers' | 'following' | null
  const [busy, setBusy] = useState(false);

  const isOwn = profileEmail === currentUserEmail;

  // People who follow this profile
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', profileEmail],
    queryFn: () => base44.entities.Follow.filter({ followed_email: profileEmail }, '-created_date', 500),
    enabled: !!profileEmail,
  });

  // People this profile follows
  const { data: following = [] } = useQuery({
    queryKey: ['following-of', profileEmail],
    queryFn: () => base44.entities.Follow.filter({ follower_email: profileEmail }, '-created_date', 500),
    enabled: !!profileEmail,
  });

  const amIFollowing = followers.find((f) => f.follower_email === currentUserEmail);

  const handleToggleFollow = async () => {
    if (isOwn) return;
    setBusy(true);
    try {
      if (amIFollowing) {
        await base44.entities.Follow.delete(amIFollowing.id);
        toast.success('Deixou de seguir');
      } else {
        await base44.entities.Follow.create({
          follower_email: currentUserEmail,
          followed_email: profileEmail,
        });
        if (authUser) {
          createNotification({ recipientEmail: profileEmail, actor: authUser, type: 'follow' });
        }
        toast.success('Agora você está seguindo');
      }
      queryClient.invalidateQueries({ queryKey: ['followers', profileEmail] });
      queryClient.invalidateQueries({ queryKey: ['following', currentUserEmail] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setList('followers')}
          className="group text-left hover:bg-muted/50 px-3 py-2 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
            <Users className="w-3 h-3" /> Colegas
          </div>
          <div className="font-display text-xl group-hover:text-gold transition-colors">
            {followers.length}
          </div>
        </button>

        <button
          onClick={() => setList('following')}
          className="group text-left hover:bg-muted/50 px-3 py-2 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
            <UserCheck className="w-3 h-3" /> Acompanhando
          </div>
          <div className="font-display text-xl group-hover:text-gold transition-colors">
            {following.length}
          </div>
        </button>

        {!isOwn && currentUserEmail && (
          <Button
            size="sm"
            onClick={handleToggleFollow}
            disabled={busy}
            className={cn(
              'h-9 gap-1.5 ml-auto',
              amIFollowing
                ? 'bg-muted text-foreground hover:bg-destructive/90 hover:text-white border border-border'
                : 'bg-gold hover:bg-gold-dark text-background'
            )}
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : amIFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" /> Acompanhando
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Seguir
              </>
            )}
          </Button>
        )}
      </div>

      <FollowListModal
        open={!!list}
        onClose={() => setList(null)}
        title={list === 'followers' ? 'Colegas' : 'Acompanhando'}
        entries={
          list === 'followers'
            ? followers.map((f) => f.follower_email)
            : following.map((f) => f.followed_email)
        }
      />
    </>
  );
}