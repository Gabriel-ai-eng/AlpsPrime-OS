import { Component } from 'react';

// Chunk antigo em cache tentando buscar um arquivo JS que não existe mais
// depois de um novo deploy (nome do arquivo muda a cada build). Sem isso,
// qualquer erro de render — incluindo esse — derrubava a árvore inteira do
// React e a tela ficava só branca, sem chance de recuperação.
function isChunkLoadError(error) {
  const msg = String(error?.message || '');
  return (
    /dynamically imported module/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error)) {
      // Só tenta recarregar automaticamente uma vez, pra não entrar em loop
      // caso o erro seja outra coisa disfarçada de falha de chunk.
      const key = 'alps:chunk-reload-attempted';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return;
      }
    }
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f5f5f7]">
        <div className="max-w-sm w-full text-center space-y-5">
          <h1 className="text-xl font-semibold text-black">Algo deu errado</h1>
          <p className="text-sm text-black/60 leading-relaxed">
            Não foi possível carregar esta página. Tente recarregar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
}
