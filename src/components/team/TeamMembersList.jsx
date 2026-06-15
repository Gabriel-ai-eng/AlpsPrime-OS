import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, User } from 'lucide-react';
import { useUsersDirectory } from '@/lib/useUsersDirectory';

export default function TeamMembersList({ members }) {
  const { getAvatar, getName } = useUsersDirectory();
  if (!members?.length) return null;
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Membros ({members.length})
      </h3>
      <div className="space-y-2.5">
        {members.map((m) => {
          const avatar = getAvatar(m.user_email);
          const name = getName(m.user_email, m.user_name);
          return (
            <Link
              key={m.id}
              to={`/profile/${encodeURIComponent(m.user_email)}`}
              className="flex items-center gap-3 hover:bg-muted rounded-xl p-2 -mx-2 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate flex items-center gap-1">
                  {name}
                  {m.role === 'owner' && <Crown className="w-3 h-3 text-gold" />}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{m.user_email}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}