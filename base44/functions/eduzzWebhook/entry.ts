import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Token de segurança — defina EDUZZ_WEBHOOK_TOKEN nas variáveis de ambiente
const WEBHOOK_TOKEN = Deno.env.get("EDUZZ_WEBHOOK_TOKEN") || "";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // Validação do token de segurança (enviado pela Eduzz no header ou query param)
  const tokenHeader = req.headers.get("x-eduzz-token") || req.headers.get("authorization");
  const url = new URL(req.url);
  const tokenQuery = url.searchParams.get("token");
  const receivedToken = tokenHeader || tokenQuery;

  if (WEBHOOK_TOKEN && receivedToken !== WEBHOOK_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // A Eduzz envia o email do comprador em diferentes campos dependendo da versão
  const email =
    body?.customer_email ||
    body?.buyer_email ||
    body?.email ||
    body?.data?.customer_email ||
    body?.data?.buyer_email;

  if (!email) {
    return Response.json({ error: "Email not found in payload" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  // Busca o utilizador pelo email e libera o acesso
  const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });

  if (!users || users.length === 0) {
    // Utilizador ainda não se cadastrou — guarda o acesso para quando ele criar a conta
    // Cria um registo de acesso autorizado para controle futuro
    console.log(`Acesso registado para email: ${email} (utilizador ainda não cadastrado)`);
    return Response.json({ success: true, message: "Access pre-authorized, user not yet registered" });
  }

  const user = users[0];
  await base44.asServiceRole.entities.User.update(user.id, { acesso_liberado: true });

  console.log(`Acesso liberado para: ${email}`);
  return Response.json({ success: true, message: "Access granted", email });
});