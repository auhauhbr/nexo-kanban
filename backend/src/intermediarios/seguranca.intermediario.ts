import type { RequestHandler } from "express";

interface Tentativas {
  quantidade: number;
  reiniciaEm: number;
}

const tentativasPorIp = new Map<string, Tentativas>();
const janelaEmMs = 15 * 60 * 1000;
const maximoTentativas = 20;

export const intermediarioCabecalhosSeguros: RequestHandler = (
  _requisicao,
  resposta,
  proximo
) => {
  resposta.setHeader("X-Content-Type-Options", "nosniff");
  resposta.setHeader("X-Frame-Options", "DENY");
  resposta.setHeader("Referrer-Policy", "no-referrer");
  resposta.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  resposta.setHeader("Cross-Origin-Resource-Policy", "same-site");
  proximo();
};

export const limitarTentativasAutenticacao: RequestHandler = (
  requisicao,
  resposta,
  proximo
) => {
  const agora = Date.now();
  const chave = requisicao.ip ?? requisicao.socket.remoteAddress ?? "desconhecido";
  const registro = tentativasPorIp.get(chave);

  if (!registro || registro.reiniciaEm <= agora) {
    tentativasPorIp.set(chave, { quantidade: 1, reiniciaEm: agora + janelaEmMs });
    proximo();
    return;
  }

  if (registro.quantidade >= maximoTentativas) {
    resposta.setHeader("Retry-After", Math.ceil((registro.reiniciaEm - agora) / 1000));
    resposta.status(429).json({
      message: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
    });
    return;
  }

  registro.quantidade += 1;
  proximo();
};
