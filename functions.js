function toNumberBR(str) {
  if (!str) return 0;

  return Number(
    str
      .replace("R$", "") // remove R$
      .replace(/\s/g, "") // remove espaços
      .replace(/\./g, "") // remove pontos
      .replace(",", ".") // vírgula → ponto
  );
}

function toBRL(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
