import React from 'react';
import { motion } from 'framer-motion';

export default function SettingsSection({ icon: Icon, title, description, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-5 lg:p-6"
    >
      {(Icon || title) && (
        <div className="flex items-start gap-3 mb-5">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gold" />
            </div>
          )}
          <div>
            {title && <h2 className="font-display text-lg leading-tight">{title}</h2>}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
}