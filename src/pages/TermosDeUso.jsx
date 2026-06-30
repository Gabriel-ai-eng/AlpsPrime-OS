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

export default function TermosDeUso() {
  const t = useT();
  return (
    <LegalSection title={t('Termos de Uso')}>
      <header className="border-b border-black/10 pb-6">
        <h1 className="text-xl font-semibold text-black sm:text-2xl">
          Termos de Uso — Alps OS
        </h1>
        <p className="mt-2 text-sm text-black/50">
          Última atualização: 30 de junho de 2026 · Versão: 1.0 (Beta)
        </p>
      </header>

      <div className="mt-8">
        <Section n="1" title="Quem somos">
          <p>
            O Alps OS ("Alps", "Plataforma", "nós") é um ecossistema digital que
            reúne, sob um único login, diversos aplicativos e jogos
            ("Sub-apps"), entre eles Projeto Armor, Sexta-feira e Vivart. O
            serviço é disponibilizado no endereço https://alpsprime.com.br e
            operado por Apex Prime Studios / Alps Prime.
          </p>
          <p>Contato oficial:</p>
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
        </Section>

        <Section n="2" title="Aceitação dos Termos">
          <p>
            Ao criar uma conta, acessar ou utilizar o Alps OS, você declara que
            leu, entendeu e concorda integralmente com estes Termos de Uso e com
            a Política de Privacidade e a Política de Pagamento e Reembolso, que
            são partes integrantes deste documento. Se você não concordar, não
            utilize a Plataforma.
          </p>
        </Section>

        <Section n="3" title="Elegibilidade e idade mínima">
          <p>
            3.1. Para criar uma conta, você deve ter pelo menos 18 anos ou estar
            devidamente representado/assistido por seus pais ou responsáveis
            legais, que serão responsáveis pelos atos praticados.
          </p>
          <p>
            3.2. Alguns Sub-apps (em especial jogos) podem ter classificação
            indicativa própria. É responsabilidade do usuário e de seus
            responsáveis observar a faixa etária recomendada.
          </p>
          <p>
            3.3. É proibido o uso por pessoas impedidas por lei ou cujas contas
            tenham sido previamente suspensas ou encerradas pelo Estúdio.
          </p>
        </Section>

        <Section n="4" title="Conta de acesso">
          <p>
            4.1. O acesso é feito por meio de um login único (autenticação por
            e-mail e serviços de terceiros, conforme disponível). Você é
            responsável por manter a confidencialidade de suas credenciais.
          </p>
          <p>
            4.2. Você se compromete a fornecer informações verdadeiras, exatas e
            atualizadas, e a não compartilhar, vender, emprestar ou transferir
            sua conta a terceiros.
          </p>
          <p>
            4.3. Notifique-nos imediatamente em caso de uso não autorizado da
            sua conta. O Estúdio não se responsabiliza por perdas decorrentes do
            descumprimento desta cláusula pelo usuário.
          </p>
        </Section>

        <Section n="5" title="Licença de uso">
          <p>
            5.1. Sujeito ao cumprimento destes Termos e ao pagamento aplicável,
            concedemos a você uma licença pessoal, limitada, não exclusiva,
            intransferível e revogável para acessar e usar o Alps OS e seus
            Sub-apps para fins de entretenimento e uso pessoal não comercial.
          </p>
          <p>
            5.2. Esta licença não transfere a você qualquer direito de
            propriedade sobre a Plataforma, os jogos, os softwares, marcas,
            artes, personagens, trilhas, códigos ou demais conteúdos.
          </p>
        </Section>

        <Section n="6" title="Conteúdo, itens virtuais e progresso">
          <p>
            6.1. Itens virtuais, moedas do jogo, skins, conquistas, níveis,
            pontuações e qualquer progresso ("Conteúdo Virtual") não possuem
            valor monetário real, não são resgatáveis por dinheiro e constituem
            apenas uma licença de uso dentro da Plataforma.
          </p>
          <p>
            6.2. O Conteúdo Virtual pode ser alterado, equilibrado
            (balanceamento), suspenso ou descontinuado a qualquer momento por
            razões de operação, segurança ou evolução do produto.
          </p>
          <p>
            6.3. É proibido comprar, vender ou trocar contas, itens ou progresso
            fora dos canais oficiais. Tais transações são nulas e podem resultar
            em suspensão.
          </p>
        </Section>

        <Section n="7" title="Conteúdo gerado pelo usuário (UGC)">
          <p>
            7.1. Alguns Sub-apps permitem que você crie, envie ou salve
            conteúdos (por exemplo, nome de perfil, imagens criadas no Vivart,
            mensagens na Sexta-feira) ("Conteúdo do Usuário").
          </p>
          <p>
            7.2. Você declara ser titular ou ter os direitos necessários sobre o
            Conteúdo do Usuário e concede ao Estúdio uma licença gratuita e não
            exclusiva para armazenar, processar e exibir esse conteúdo
            estritamente para operar o serviço.
          </p>
          <p>
            7.3. É proibido publicar conteúdo ilegal, ofensivo, discriminatório,
            violento, sexualmente explícito, que viole direitos de terceiros
            (incluindo propriedade intelectual) ou que represente discurso de
            ódio. Podemos remover conteúdo e aplicar sanções.
          </p>
        </Section>

        <Section n="8" title="Conduta do usuário">
          <p>Você concorda em não:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              usar trapaças (cheats), bots, automações, exploits ou modificações
              não autorizadas;
            </li>
            <li>
              realizar engenharia reversa, descompilar ou tentar extrair o
              código-fonte;
            </li>
            <li>
              sobrecarregar, invadir ou comprometer a segurança e a
              infraestrutura;
            </li>
            <li>coletar dados de outros usuários sem autorização;</li>
            <li>
              usar a Plataforma para fins ilícitos, fraudulentos ou que
              prejudiquem terceiros;
            </li>
            <li>contornar mecanismos de acesso, pagamento ou regiões.</li>
          </ul>
        </Section>

        <Section n="9" title="Inteligência Artificial">
          <p>
            9.1. Alguns recursos utilizam inteligência artificial (por exemplo,
            a assistente Sexta-feira e a geração de imagens do Vivart). As
            respostas e resultados são gerados automaticamente e podem conter
            imprecisões; não constituem aconselhamento profissional (jurídico,
            médico, financeiro etc.).
          </p>
          <p>
            9.2. Você é responsável pelo uso que faz dos resultados e por não
            inserir dados sensíveis desnecessários ou conteúdos proibidos nos
            recursos de IA.
          </p>
        </Section>

        <Section n="10" title="Serviços de terceiros">
          <p>
            A Plataforma integra serviços de terceiros (por exemplo,
            processamento de pagamento via Hotmart, infraestrutura via
            Supabase/Vercel, login e notificações). O uso desses serviços pode
            estar sujeito a termos próprios. Não nos responsabilizamos por
            falhas ou políticas de terceiros.
          </p>
        </Section>

        <Section n="11" title="Disponibilidade e versão Beta">
          <p>
            11.1. O Alps OS pode estar em versão Beta, em aperfeiçoamento
            contínuo, podendo apresentar erros, indisponibilidades e mudanças de
            funcionalidades.
          </p>
          <p>
            11.2. Podemos modificar, suspender ou descontinuar Sub-apps,
            recursos ou o serviço como um todo, no todo ou em parte, mediante
            aviso quando exigido por lei.
          </p>
        </Section>

        <Section n="12" title="Propriedade intelectual">
          <p>
            Todos os direitos de propriedade intelectual sobre o Alps OS, seus
            Sub-apps, marcas, logotipos, personagens, artes e códigos pertencem
            ao Estúdio ou a seus licenciadores. Nada nestes Termos concede a você
            qualquer direito sobre tais ativos além da licença limitada da
            Cláusula 5.
          </p>
        </Section>

        <Section n="13" title="Pagamentos">
          <p>
            As condições de compra, ativação de acesso, preços, reembolso e
            direito de arrependimento estão descritas na Política de Pagamento e
            Reembolso.
          </p>
        </Section>

        <Section n="14" title="Isenções e limitação de responsabilidade">
          <p>
            14.1. A Plataforma é fornecida "no estado em que se encontra" ("as
            is"), sem garantias de funcionamento ininterrupto ou livre de erros,
            observados os direitos do consumidor.
          </p>
          <p>
            14.2. Na máxima extensão permitida pela legislação, o Estúdio não
            será responsável por danos indiretos, lucros cessantes ou perda de
            dados decorrentes do uso ou impossibilidade de uso da Plataforma.
          </p>
          <p>
            14.3. Nada nestes Termos exclui responsabilidades que não possam ser
            limitadas por força do Código de Defesa do Consumidor e demais
            normas aplicáveis.
          </p>
        </Section>

        <Section n="15" title="Indenização">
          <p>
            Você concorda em isentar e indenizar o Estúdio por perdas
            decorrentes do seu descumprimento destes Termos, do uso indevido da
            Plataforma ou da violação de direitos de terceiros.
          </p>
        </Section>

        <Section n="16" title="Suspensão e encerramento">
          <p>
            16.1. Podemos suspender ou encerrar o acesso em caso de violação
            destes Termos, fraude, abuso ou exigência legal.
          </p>
          <p>
            16.2. Você pode encerrar sua conta a qualquer momento pelas
            Configurações do app. O encerramento da conta não cancela
            automaticamente eventual compra realizada na Hotmart (ver Política
            de Pagamento).
          </p>
        </Section>

        <Section n="17" title="Alterações nos Termos">
          <p>
            Podemos atualizar estes Termos periodicamente. Mudanças relevantes
            serão comunicadas pelos canais oficiais. O uso continuado após a
            atualização representa concordância com a nova versão.
          </p>
        </Section>

        <Section n="18" title="Lei aplicável e foro">
          <p>
            Estes Termos são regidos pelas leis da República Federativa do
            Brasil. Fica eleito o foro da comarca disponibilizado, salvo
            competência legal diversa em favor do consumidor.
          </p>
        </Section>

        <Section n="19" title="Contato">
          <p>
            Dúvidas sobre estes Termos podem ser enviadas para{' '}
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
