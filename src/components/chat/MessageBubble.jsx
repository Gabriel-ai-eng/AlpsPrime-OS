import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function ImageMessage({ url, prompt }) {
  return (
    <div className="space-y-2">
      <img src={url} alt={prompt} className="rounded-xl max-w-sm w-full object-cover border border-border" />
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Baixar imagem
      </a>
    </div>
  );
}

function SpreadsheetMessage({ content, fileName }) {
  // Parse CSV-like content
  const lines = content.trim().split('\n');
  const headers = lines[0]?.split(',').map(h => h.trim()) || [];
  const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));

  const downloadCsv = () => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'planilha.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gold text-sm font-medium">
        <FileSpreadsheet className="w-4 h-4" />
        {fileName || 'Planilha gerada'}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border max-w-full">
        <table className="text-xs w-full">
          <thead className="bg-gold/10">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-gold border-b border-border whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={downloadCsv}
        className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        Baixar CSV
      </button>
    </div>
  );
}

export default function MessageBubble({ message, user, index }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.02 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-light via-gold to-gold-dark flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-gold/20">
          <Sparkles className="w-4 h-4 text-background" strokeWidth={2.5} />
        </div>
      )}

      <div className={cn("max-w-[85%]", isUser ? "items-end" : "items-start", "flex flex-col gap-1")}>
        {message.type === 'image' && message.image_url ? (
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <ImageMessage url={message.image_url} prompt={message.content} />
          </div>
        ) : message.type === 'spreadsheet' ? (
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <SpreadsheetMessage content={message.content} fileName={message.file_name} />
          </div>
        ) : isUser ? (
          <div className="bg-gold text-background rounded-2xl px-4 py-3 max-w-full">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <ReactMarkdown
              className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-2 prose-headings:font-display prose-code:text-gold prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-background prose-pre:border prose-pre:border-border"
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
          {user?.profile_picture_url ? (
            <img src={user.profile_picture_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </div>
      )}
    </motion.div>
  );
}