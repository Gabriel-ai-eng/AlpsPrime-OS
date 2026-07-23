import React from 'react';
import LegalSection from '@/components/LegalSection';
import { useT } from '@/lib/i18n';

// Bloco de uma seção numerada da política (título + parágrafos/itens).
function Section({ n, title, children }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-base font-semibold text-black">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-black/70">
        {children}
      </div>
    </section>
  );
}

export default function Privacidade() {
  const t = useT();
  return (
    <LegalSection title={t('Privacidade')}>
      <header className="border-b border-black/10 pb-6">
        <h1 className="text-xl font-semibold text-black sm:text-2xl">
          Política de Privacidade — Alps OS
        </h1>
        <p className="mt-2 text-sm text-black/50">
          Última atualização: 30 de junho de 2026 · Versão: 1.0 (Beta)
        </p>
      </header>

      <div className="mt-8">
        <Section n="1" title="Controlador dos dados">
          <p>
            O tratamento dos seus dados pessoais é realizado por Alps Prime
            Studios / Alps Prime ("nós"), responsável pelo ecossistema Alps OS
            (https://alpsprime.com.br).
          </p>
          <p>
            Encarregado(a) / contato de privacidade (DPO):{' '}
            <a
              href="mailto:team@alpsprime.com.br"
              className="underline underline-offset-2 hover:text-black"
            >
              team@alpsprime.com.br
            </a>
          </p>
          <p>Suporte: WhatsApp +55 (14) 99907-5111</p>
        </Section>

        <Section n="2" title="Princípios">
          <p>
            Tratamos seus dados com base nos princípios da LGPD: finalidade,
            adequação, necessidade, transparência, segurança e prevenção. Não
            vendemos seus dados pessoais.
          </p>
        </Section>

        <Section n="3" title="Dados que coletamos">
          <h3 className="font-medium text-black">3.1. Dados que você fornece</h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Cadastro/login: e-mail e nome de exibição (perfil).
            </li>
            <li>
              Compra: dados necessários para validar seu acesso, vinculados ao
              e-mail utilizado na compra (processada pela Hotmart).
            </li>
            <li>
              Conteúdo do usuário: mensagens enviadas à assistente de IA
              (Sexta-feira), nome de perfil e preferências.
            </li>
          </ul>

          <h3 className="pt-2 font-medium text-black">
            3.2. Dados coletados automaticamente
          </h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Uso e desempenho: progresso e pontuação em jogos (Wonderbound),
              tempo de uso e métricas de utilização, registros técnicos (logs),
              identificadores de dispositivo/sessão.
            </li>
            <li>
              Notificações: status da permissão de notificações do navegador
              (por dispositivo e por sub-app).
            </li>
            <li>
              Armazenamento local: preferências, cache e dados temporários
              guardados no seu dispositivo (ver Cláusula 8).
            </li>
          </ul>

          <h3 className="pt-2 font-medium text-black">
            3.3. O que cada Sub-app acessa
          </h3>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              Sexta-feira: conversas e mensagens com a IA; suas preferências de
              uso.
            </li>
            <li>Wonderbound: progresso e pontuação no jogo.</li>
          </ul>
        </Section>

        <Section n="4" title="Para que usamos os dados (finalidades)">
          <ul className="ml-5 list-disc space-y-1">
            <li>
              criar e autenticar sua conta e liberar o acesso adquirido;
            </li>
            <li>operar, manter e melhorar os Sub-apps e recursos;</li>
            <li>salvar progresso, criações e preferências;</li>
            <li>
              enviar notificações e comunicações relevantes (quando autorizado);
            </li>
            <li>prevenir fraudes, abusos e violações de segurança;</li>
            <li>cumprir obrigações legais e regulatórias.</li>
          </ul>
        </Section>

        <Section n="5" title="Bases legais (LGPD)">
          <p>
            Tratamos dados com fundamento em: execução de contrato (prestar o
            serviço), consentimento (ex.: notificações), legítimo interesse
            (melhoria e segurança, sem sobrepor seus direitos) e cumprimento de
            obrigação legal.
          </p>
        </Section>

        <Section n="6" title="Compartilhamento e operadores">
          <p>
            Compartilhamos dados apenas com prestadores que viabilizam o
            serviço, como:
          </p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Hotmart — processamento de pagamento e validação de acesso;</li>
            <li>Supabase — autenticação e banco de dados;</li>
            <li>Vercel — hospedagem e entrega da aplicação;</li>
            <li>
              provedores de login e notificações e de IA utilizados pelos
              recursos.
            </li>
          </ul>
          <p>
            Esses parceiros tratam dados conforme suas próprias políticas e
            somente para as finalidades aqui descritas. Também poderemos
            compartilhar dados para cumprir ordem judicial ou exigência legal.
          </p>
        </Section>

        <Section n="7" title="Transferência internacional">
          <p>
            Alguns parceiros podem armazenar/processar dados em servidores fora
            do Brasil. Nesses casos, adotamos salvaguardas compatíveis com a
            LGPD para proteger seus dados.
          </p>
        </Section>

        <Section n="8" title="Cookies e armazenamento local">
          <p>
            Utilizamos cookies e tecnologias de armazenamento local
            (localStorage, cache) para manter sua sessão, lembrar preferências e
            melhorar o desempenho. Você pode limpar o cache pelas Configurações
            do app ou pelo seu navegador.
          </p>
        </Section>

        <Section n="9" title="Retenção e exclusão">
          <p>
            9.1. Mantemos os dados pelo tempo necessário às finalidades e às
            obrigações legais.
          </p>
          <p>
            9.2. Você pode apagar sua conta a qualquer momento pelas
            Configurações do app, o que remove seu perfil e dados associados do
            Alps OS. A exclusão da conta não cancela sua compra na Hotmart — com
            o mesmo e-mail será possível acessar novamente no futuro.
          </p>
        </Section>

        <Section n="10" title="Segurança">
          <p>
            Adotamos medidas técnicas e administrativas razoáveis para proteger
            seus dados contra acessos não autorizados, perda ou alteração.
            Nenhum sistema é 100% seguro; em caso de incidente relevante,
            agiremos conforme a LGPD.
          </p>
        </Section>

        <Section n="11" title="Seus direitos (art. 18 da LGPD)">
          <p>Você pode solicitar, a qualquer momento:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>confirmação da existência de tratamento;</li>
            <li>acesso, correção e atualização dos dados;</li>
            <li>
              anonimização, bloqueio ou eliminação de dados desnecessários;
            </li>
            <li>portabilidade, nos termos da lei;</li>
            <li>informação sobre compartilhamentos;</li>
            <li>revogação do consentimento.</li>
          </ul>
          <p>
            Para exercer seus direitos, escreva para{' '}
            <a
              href="mailto:team@alpsprime.com.br"
              className="underline underline-offset-2 hover:text-black"
            >
              team@alpsprime.com.br
            </a>
            .
          </p>
        </Section>

        <Section n="12" title="Crianças e adolescentes">
          <p>
            O Alps OS não se destina a menores sem o consentimento e a
            supervisão dos pais ou responsáveis. Não coletamos intencionalmente
            dados de crianças sem a base legal adequada. Caso identifique tal
            situação, entre em contato para remoção.
          </p>
        </Section>

        <Section n="13" title="Alterações desta Política">
          <p>
            Poderemos atualizar esta Política periodicamente. Mudanças
            relevantes serão comunicadas pelos canais oficiais, com indicação da
            nova data de atualização.
          </p>
        </Section>

        <Section n="14" title="Contato">
          <p>
            Dúvidas sobre privacidade e proteção de dados:{' '}
            <a
              href="mailto:team@alpsprime.com.br"
              className="underline underline-offset-2 hover:text-black"
            >
              team@alpsprime.com.br
            </a>
            .
          </p>
        </Section>
      </div>
    </LegalSection>
  );
}
