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

export default function Pagamento() {
  const t = useT();
  return (
    <LegalSection title={t('Pagamento')}>
      <header className="border-b border-black/10 pb-6">
        <h1 className="text-xl font-semibold text-black sm:text-2xl">
          Política de Pagamento e Reembolso — Alps OS
        </h1>
        <p className="mt-2 text-sm text-black/50">
          Última atualização: 30 de junho de 2026 · Versão: 1.0 (Beta)
        </p>
      </header>

      <div className="mt-8">
        <Section n="1" title="Como funciona o acesso">
          <p>
            1.1. O acesso ao Alps OS é liberado mediante compra realizada na
            plataforma Hotmart, parceira responsável pelo processamento do
            pagamento.
          </p>
          <p>1.2. O fluxo é:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Na tela inicial (Welcome), o usuário escolhe comprar;</li>
            <li>O pagamento é concluído na Hotmart, com um e-mail;</li>
            <li>
              O usuário faz login no Alps OS usando o mesmo e-mail da compra;
            </li>
            <li>O acesso é validado automaticamente e liberado.</li>
          </ul>
          <p>
            1.3. <strong className="font-medium text-black">Importante:</strong>{' '}
            utilize o mesmo e-mail na compra e no login/cadastro. Compras com
            e-mail diferente do login podem não ser reconhecidas
            automaticamente — nesse caso, contate o suporte.
          </p>
        </Section>

        <Section n="2" title="Preços e formas de pagamento">
          <p>
            2.1. Os preços, planos e condições vigentes são exibidos no momento
            da compra na Hotmart. Valor de referência: R$ 19,90.
          </p>
          <p>
            2.2. As formas de pagamento disponíveis (cartão, Pix, boleto etc.)
            são as oferecidas pela Hotmart no checkout.
          </p>
          <p>
            2.3. Eventuais tributos aplicáveis seguem a legislação vigente e
            podem estar incluídos no preço final exibido.
          </p>
        </Section>

        <Section n="3" title="Confirmação e prazo de liberação">
          <p>
            3.1. A liberação do acesso depende da confirmação do pagamento pela
            Hotmart. Pagamentos por cartão/Pix costumam ser confirmados
            rapidamente; boleto pode levar até alguns dias úteis.
          </p>
          <p>
            3.2. Caso o pagamento esteja confirmado e o acesso não tenha sido
            liberado em tempo razoável, entre em contato pelo suporte.
          </p>
        </Section>

        <Section n="4" title="Natureza do produto">
          <p>
            4.1. O acesso concede uma licença de uso do ecossistema e de seus
            Sub-apps, conforme os Termos de Uso.
          </p>
          <p>
            4.2. Itens virtuais, moedas, skins e progresso não possuem valor
            monetário real, não são resgatáveis por dinheiro e não são
            reembolsáveis isoladamente.
          </p>
        </Section>

        <Section n="5" title="Direito de arrependimento (CDC, art. 49)">
          <p>
            5.1. Por se tratar de compra realizada fora do estabelecimento
            físico (pela internet), você tem o direito de se arrepender em até 7
            (sete) dias corridos, contados da data da compra ou da liberação do
            acesso, o que ocorrer por último.
          </p>
          <p>
            5.2. Dentro desse prazo, a solicitação de cancelamento dará direito
            à devolução integral do valor pago.
          </p>
          <p>
            5.3. A solicitação pode ser feita diretamente pela Hotmart (que
            opera a transação) e/ou pelo suporte do Alps OS, que auxiliará no
            processo.
          </p>
        </Section>

        <Section n="6" title="Reembolsos após 7 dias">
          <p>
            6.1. Após o prazo de arrependimento, reembolsos serão avaliados caso
            a caso, observada a legislação e a política da Hotmart, em especial
            nas hipóteses de falha do serviço ou cobrança indevida.
          </p>
          <p>
            6.2. O prazo e o meio de devolução seguem as regras do meio de
            pagamento e da Hotmart.
          </p>
        </Section>

        <Section n="7" title="Processamento pela Hotmart">
          <p>
            7.1. O pagamento, a emissão de comprovantes e a gestão de
            reembolsos/estornos são operados pela Hotmart, sujeitos aos termos e
            à política da plataforma.
          </p>
          <p>
            7.2. O Estúdio não armazena os dados completos de cartão de crédito
            do usuário — esses dados são tratados pelo ambiente seguro da
            Hotmart.
          </p>
        </Section>

        <Section n="8" title="Estornos e contestações (chargeback)">
          <p>
            8.1. Contestações indevidas ou fraudulentas poderão resultar na
            suspensão imediata do acesso, sem prejuízo das medidas cabíveis.
          </p>
          <p>
            8.2. Em caso de cobrança que você não reconheça, contate o suporte
            antes de abrir uma disputa, para que possamos verificar e resolver.
          </p>
        </Section>

        <Section n="9" title="Renovações e alterações de preço">
          <p>
            9.1. Caso haja planos recorrentes/assinaturas, as condições de
            renovação serão informadas no checkout da Hotmart no momento da
            contratação.
          </p>
          <p>
            9.2. Mudanças de preço não afetam compras já concluídas e serão
            comunicadas com antecedência quando aplicável.
          </p>
        </Section>

        <Section n="10" title="Encerramento de conta x compra">
          <p>
            Apagar sua conta no Alps OS não cancela automaticamente a compra
            realizada na Hotmart. Com o mesmo e-mail, será possível acessar
            novamente no futuro, enquanto o acesso adquirido estiver válido.
          </p>
        </Section>

        <Section n="11" title="Versão Beta">
          <p>
            O Alps OS pode estar em versão Beta, em aperfeiçoamento. Eventuais
            instabilidades não caracterizam, por si só, descumprimento
            contratual, mas você mantém todos os direitos previstos no Código de
            Defesa do Consumidor.
          </p>
        </Section>

        <Section n="12" title="Suporte e atendimento">
          <ul className="ml-5 list-disc space-y-1">
            <li>
              E-mail:{' '}
              <a
                href="mailto:team@alpsprime.com.br"
                className="underline underline-offset-2 hover:text-black"
              >
                team@alpsprime.com.br
              </a>
            </li>
            <li>WhatsApp: +55 (14) 99907-5111</li>
          </ul>
          <p>
            Para questões de pagamento, informe o e-mail usado na compra e, se
            possível, o comprovante/ID da transação da Hotmart, para agilizar o
            atendimento.
          </p>
        </Section>
      </div>
    </LegalSection>
  );
}
