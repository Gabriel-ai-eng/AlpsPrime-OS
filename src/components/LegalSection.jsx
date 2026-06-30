import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Seção institucional (Termos de Uso, Privacidade, Pagamento). O cabeçalho traz
// o título e o botão de voltar; o conteúdo de cada seção é passado via children.
export default function LegalSection({ title, children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-[#f5f5f7]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4 sm:px-8">
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="grid h-9 w-9 place-items-center rounded-full text-black/60 transition-colors hover:bg-black/5 hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
