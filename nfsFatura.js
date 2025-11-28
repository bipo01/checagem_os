fatura.addEventListener("change", async () => {
  const file = fatura.files[0];
  if (!file) return (nfsFatura = []);

  const arrayBuffer = await file.arrayBuffer();

  extractPDF(arrayBuffer);
});

async function extractPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let textoFinal = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map((item) => item.str).join(" ");

    textoFinal += "\n" + pageText;
  }

  const linhas = separarPorLinha(
    extrairSecao(textoFinal, "Ordem de Compra / Serviço")
  );

  nfsFatura = linhas.map((linha) => {
    const linhaArr = linha.split(" ");

    const dinheiros = linhaArr
      .map((el, i) => {
        if (el === "R$") {
          return linhaArr[i + 1];
        }
      })
      .filter((el) => el);
    const valorMO = Number(
      dinheiros[0].replaceAll(".", "").replaceAll(",", ".")
    );
    const valorPC = Number(
      dinheiros[1].replaceAll(".", "").replaceAll(",", ".")
    );

    const valor = valorMO > 0 ? valorMO : valorPC;

    const numOS = linhaArr[0];
    const tipo = valorMO > 0 ? "M" : "P";

    return { numeroOS: numOS, tipo, valor, origem: "Fatura" };
  });
}

function extrairSecao(texto, titulo) {
  const cleanText = texto.replace(/\s+/g, " ").trim();

  // Procura a posição exata do título
  const indexTitulo = cleanText.toUpperCase().indexOf(titulo.toUpperCase());

  if (indexTitulo === -1) {
    return `❌ Seção "${titulo}" não encontrada.`;
  }

  // Corta exatamente DEPOIS do título
  let depois = cleanText.slice(indexTitulo + titulo.length).trim();

  return depois;
}

function separarPorLinha(texto) {
  return texto
    .replace(/(\d{4,6}\s+\d{2}\/\d{2}\/\d{4})/g, "\n$1")
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 5); // descarta linhas vazias
}
