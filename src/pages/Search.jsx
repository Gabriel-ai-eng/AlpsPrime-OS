import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Search as SearchIcon,
  Sparkles,
  Gamepad2,
  Bot,
  Settings,
  Folder,
  Globe,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const APPS = [
  {
    id: "ai-chat",
    name: "AI Chat",
    description: "Converse com sua IA principal",
    icon: Bot,
    category: "IA",
    route: "/ai"
  },
  {
    id: "armor",
    name: "Projeto Armor",
    description: "Seu jogo sci-fi pixel futurista",
    icon: Gamepad2,
    category: "Games",
    route: "/armor"
  },
  {
    id: "files",
    name: "Arquivos",
    description: "Gerencie seus documentos",
    icon: Folder,
    category: "Sistema",
    route: "/files"
  },
  {
    id: "browser",
    name: "Navegador",
    description: "Explore a web",
    icon: Globe,
    category: "Internet",
    route: "/browser"
  },
  {
    id: "settings",
    name: "Configurações",
    description: "Personalize sua experiência",
    icon: Settings,
    category: "Sistema",
    route: "/settings"
  }
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(query.trim().toLowerCase());
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const filteredApps = useMemo(() => {
    if (!debounced) return APPS;

    return APPS.filter((app) => {
      const haystack =
        `${app.name} ${app.description} ${app.category}`.toLowerCase();

      return haystack.includes(debounced);
    });
  }, [debounced]);

  return (
    <div className="min-h-full bg-background">
      {/* Hero */}
      <div className="px-4 lg:px-6 py-8 border-b border-border">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Spotlight
            </span>
          </div>

          <h1 className="font-display text-4xl tracking-tight mb-5">
            Explore seus <span className="gold-gradient italic">Apps</span>
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center">
              <SearchIcon className="w-5 h-5 text-muted-foreground" />
            </div>

            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar apps, ferramentas ou jogos..."
              className="
                pl-12
                h-14
                rounded-2xl
                border-border
                bg-card/80
                backdrop-blur-xl
                text-base
                shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                focus-visible:ring-1
                focus-visible:ring-gold/40
              "
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6">

        {!debounced && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Sugestões
          </p>
        )}

        {filteredApps.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum app encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app, index) => {
              const Icon = app.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <Link
                    to={app.route}
                    className="
                      flex
                      items-center
                      gap-4
                      p-4
                      rounded-2xl
                      border
                      border-border
                      bg-card/70
                      backdrop-blur-xl
                      hover:border-gold/20
                      hover:bg-card
                      transition-all
                    "
                  >
                    {/* Icon */}
                    <div
                      className="
                        w-14 h-14
                        rounded-2xl
                        flex items-center justify-center
                        bg-gradient-to-br
                        from-gold/20
                        to-gold/5
                      "
                    >
                      <Icon className="w-6 h-6 text-gold" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {app.name}
                      </h3>

                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {app.description}
                      </p>

                      <span className="text-[10px] uppercase tracking-widest text-gold mt-2 block">
                        {app.category}
                      </span>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}