import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Plugin: expõe URL + anon key do Supabase para o jogo estático em /game/.
// O jogo (public/game/index.html) é uma página separada (mesma origem) e NÃO passa
// pelo bundler, então não enxerga import.meta.env. Aqui geramos um pequeno
// /game/supabase-config.js (window.__ALPS_SB__) tanto no dev quanto no build.
// Os valores (URL + anon key) são PÚBLICOS — já vão no bundle do app e são
// protegidos por RLS no banco; não há segredo sendo exposto.
function gameSupabaseConfig(mode) {
  const env = loadEnv(mode, process.cwd(), '');
  const cfg = {
    url: env.VITE_SUPABASE_URL || '',
    anonKey: env.VITE_SUPABASE_ANON_KEY || '',
  };
  const body =
    'window.__ALPS_SB__=' + JSON.stringify(cfg) + ';\n';
  return {
    name: 'game-supabase-config',
    // Dev: serve o arquivo dinamicamente.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split('?')[0] === '/game/supabase-config.js') {
          res.setHeader('Content-Type', 'application/javascript');
          res.end(body);
          return;
        }
        next();
      });
    },
    // Build: grava dist/game/supabase-config.js.
    closeBundle() {
      try {
        const dir = resolve(process.cwd(), 'dist', 'game');
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'supabase-config.js'), body);
      } catch (e) {
        this.warn('Não consegui gravar dist/game/supabase-config.js: ' + e.message);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    react(),
    gameSupabaseConfig(mode),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}));
