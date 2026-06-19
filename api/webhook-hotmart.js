export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Apenas POST' });
  }

  // Valida o token de segurança da Hotmart
  const hottokRecebido = req.headers['x-hotmart-hottok'];
  const hottokEsperado = process.env.HOTMART_HOTTOK;
  if (!hottokRecebido || hottokRecebido !== hottokEsperado) {
    return res.status(401).json({ erro: 'Token inválido' });
  }

  // Pega os dados da Hotmart
  const dados = req.body;
  const evento = dados.event;
  const email = dados.data?.buyer?.email;
  const transacao = dados.data?.purchase?.transaction;

  if (!email) {
    return res.status(400).json({ erro: 'Email em falta' });
  }

  // Decide se libera ou bloqueia o acesso
  let ativo = null;
  if (evento === 'PURCHASE_APPROVED' || evento === 'PURCHASE_COMPLETE') {
    ativo = true;
  } else if (
    evento === 'PURCHASE_REFUNDED' ||
    evento === 'PURCHASE_CHARGEBACK' ||
    evento === 'PURCHASE_CANCELED'
  ) {
    ativo = false;
  } else {
    // Outros eventos (aguardando pagamento, etc.) — ignora
    return res.status(200).json({ ok: true, ignorado: true });
  }

  // Escreve no Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const resposta = await fetch(`${supabaseUrl}/rest/v1/acessos_pagos`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      ativo,
      transacao_id: transacao,
    }),
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    console.error('Erro Supabase:', erro);
    return res.status(500).json({ erro: 'Falha ao gravar' });
  }

  return res.status(200).json({ ok: true });
}
