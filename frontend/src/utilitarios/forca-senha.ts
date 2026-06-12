export interface RequisitoSenha {
  id: string;
  rotulo: string;
  atendido: boolean;
}

export const avaliarSenha = (senha: string) => {
  const requisitos: RequisitoSenha[] = [
    { id: "tamanho", rotulo: "12 caracteres", atendido: senha.length >= 12 },
    { id: "minuscula", rotulo: "uma minúscula", atendido: /[a-zà-ÿ]/.test(senha) },
    { id: "maiuscula", rotulo: "uma maiúscula", atendido: /[A-ZÀ-Þ]/.test(senha) },
    { id: "numero", rotulo: "um número", atendido: /[0-9]/.test(senha) },
    {
      id: "especial",
      rotulo: "um caractere especial",
      atendido: /[^A-Za-zÀ-ÿ0-9\s]/.test(senha)
    },
    {
      id: "repeticao",
      rotulo: "sem 4 caracteres repetidos",
      atendido: senha.length > 0 && !/(.)\1{3}/i.test(senha)
    }
  ];
  const pontuacao = requisitos.filter((requisito) => requisito.atendido).length;
  const percentual = Math.round((pontuacao / requisitos.length) * 100);
  const nivel =
    pontuacao <= 2 ? "fraca" : pontuacao <= 4 ? "média" : pontuacao === 5 ? "forte" : "excelente";

  return {
    requisitos,
    pontuacao,
    percentual: senha ? percentual : 0,
    nivel: senha ? nivel : "vazia",
    valida: requisitos.every((requisito) => requisito.atendido)
  };
};
