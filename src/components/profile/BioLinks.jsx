import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { getBioLinkMeta } from '@/lib/bioLinkPresets';
import { Translated } from '@/components/profile/ProfileTranslator';

/**
 * Public Bio Links display — appears on every profile that has links saved.
 * Pro/Unlimited users with bio_links populated will show this card.
 */
export default function BioLinks({ links }) {
  const valid = (links || []).filter((l) => l && l.title && l.url);
  if (!valid.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <ExternalLink className="w-4 h-4 text-gold" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Links
        </h2>
      </div>
      <div className="space-y-2">
        {valid.map((link, i) => {
          const meta = getBioLinkMeta(link.type);
          const Icon = meta.icon;
          return (
            <motion.a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-gold/40 hover:bg-gold/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <Translated id={`biolink-${i}`} as="p" className="text-sm font-medium truncate">
                  {link.title}
                </Translated>
                <p className="text-[11px] text-muted-foreground truncate">
                  {link.url.replace(/^https?:\/\//, '').replace(/^mailto:|^tel:/, '')}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}