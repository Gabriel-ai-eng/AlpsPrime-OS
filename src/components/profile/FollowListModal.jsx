import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsersDirectory } from '@/lib/useUsersDirectory';

export default function FollowListModal({ open, onClose, title, entries = [] }) {
  // Puxa a "agenda global" do seu app para traduzir o e-mail em dados reais
  const { getAvatar, getName } = useUsersDirectory();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-3xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/10">
              <h3 className="font-display text-xl tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
              {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <User className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">Lista vazia.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {entries.map((email) => {
                    const avatar = getAvatar(email);
                    const name = getName(email) || 'Usuário';

                    return (
                      <Link
                        key={email}
                        to={`/profile/${encodeURIComponent(email)}`}
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-muted/50 transition-colors group"
                      >
                        {/* FOTO DE PERFIL REAL */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center overflow-hidden ring-1 ring-gold/20 group-hover:ring-gold/50 transition-all">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gold" />
                          )}
                        </div>
                        
                        {/* NOME PRINCIPAL E TEXTO DE APOIO */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-gold transition-colors">{name}</p>
                          <p className="text-[11px] text-muted-foreground truncate uppercase tracking-wider mt-0.5">Ver perfil</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
