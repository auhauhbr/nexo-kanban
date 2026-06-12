import assert from "node:assert/strict";
import test from "node:test";

import { avaliarSenha } from "../utilitarios/forca-senha";

test("aceita senha que atende a todos os requisitos", () => {
  const resultado = avaliarSenha("NexoSeguro#2026");

  assert.equal(resultado.valida, true);
  assert.equal(resultado.percentual, 100);
  assert.equal(resultado.nivel, "excelente");
});

test("rejeita senha sem caractere especial ou com repetição excessiva", () => {
  assert.equal(avaliarSenha("NexoSeguro2026").valida, false);
  assert.equal(avaliarSenha("Nexo####Seguro2026").valida, false);
});
