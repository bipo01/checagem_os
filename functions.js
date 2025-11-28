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

function insertTotals(arr, title, element) {
  const valorTotal = arr?.reduce((acc, cur) => acc + Number(cur.valor), 0);
  const valorMO = arr
    ?.filter((el) => el.tipo === "M")
    ?.reduce((acc, cur) => acc + Number(cur.valor), 0);
  const valorPC = arr
    ?.filter((el) => el.tipo === "P")
    ?.reduce((acc, cur) => acc + Number(cur.valor), 0);

  if (valorTotal && valorMO && valorPC) {
    element.innerHTML = `
    <h2>${title}</h2>
    <h3>
    Total de Mão de Obra: <span class="spanTotalMO">${toBRL(valorMO)}</span>
    </h3>
    <h3>
    Total de Peças: <span class="spanTotalPC">${toBRL(valorPC)}</span>
    </h3>
    <h3>
    Total: <span class="spanTotal">${toBRL(valorTotal)}</span>
    </h3>
    `;
  }
}

async function getDataGS() {
  const response = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTfM0nGoCsDmmp0W15By-T3GP9ncKCtTDSQ2XHgnQHnLQVpjZqQAXe42NpsMIRd9-UkxH34g8y2zo3Q/pub?gid=0&single=true&output=csv"
  );

  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  dataGS = parsed.data.slice(1);

  headerGS = {};

  parsed.data[0].forEach((col, i) => (headerGS[`${col}`] = i));
}

function writeResult(obj, valoresDiferentes) {
  obj.forEach((nf) => {
    resultado
      .querySelector(`.tipo${nf.origem}`)
      .insertAdjacentHTML(
        "beforeend",
        `<h3  class="${nf.tipo === "-" ? "h3Null" : ""} ${
          valoresDiferentes.length > 1 ? "valoresDiferentes" : ""
        }">${
          nf.tipo === "M" ? "Mão de Obra" : nf.tipo === "P" ? "Peças" : "-"
        }</h3>`
      );
    resultado
      .querySelector(`.valor${nf.origem}`)
      .insertAdjacentHTML(
        "beforeend",
        `<h3 class="${nf.valor === "-" ? "h3Null" : ""} ${
          valoresDiferentes.length > 1 ? "valoresDiferentes" : ""
        }">${toBRL(nf.valor)}</h3>`
      );
  });
}

function filterDataGS() {
  const filteredData = dataGS.filter(
    (row) =>
      row[headerGS["Mês de Finalização"]] == mesFinalizacaoGS.value &&
      row[headerGS["Ano de Finalização"]] == anoFinalizacaoGS.value
  );
  let totalPecas = 0;
  let totalMaoDeObra = 0;
  let total = 0;

  filteredData.forEach((row) => {
    const valorPecas = toNumberBR(row[headerGS["Peças"]]);
    const valorMaoDeObra = toNumberBR(row[headerGS["Mão de Obra"]]);
    const valorTotal = toNumberBR(row[headerGS["Total"]]);

    totalPecas += valorPecas;
    totalMaoDeObra += valorMaoDeObra;
    total += valorTotal;
  });

  filteredData.forEach((row) => {
    const numeroOS = row[headerGS["O.S"]];
    let tipo;
    let valor;
    const status = row[headerGS["Situação"]];
    if (toNumberBR(row[headerGS["Peças"]]) > 0) {
      tipo = "P";
      valor = toNumberBR(row[headerGS["Peças"]]);
      nfsGS.push({ numeroOS, tipo, valor, origem: "GS", status });
    }

    if (toNumberBR(row[headerGS["Mão de Obra"]]) > 0) {
      tipo = "M";
      valor = toNumberBR(row[headerGS["Mão de Obra"]]);
      nfsGS.push({ numeroOS, tipo, valor, origem: "GS", status });
    }
  });
}

function resetUI() {
  resultado.querySelector(`.numeroOS`).innerHTML = "";
  resultado.querySelector(`.tipoGS`).innerHTML = "";
  resultado.querySelector(`.tipoPasta`).innerHTML = "";
  resultado.querySelector(`.tipoFatura`).innerHTML = "";
  resultado.querySelector(`.valorGS`).innerHTML = "";
  resultado.querySelector(`.valorPasta`).innerHTML = "";
  resultado.querySelector(`.valorFatura`).innerHTML = "";
  nfsGS = [];

  totalGS.innerHTML = "";
  totalPasta.innerHTML = "";
  totalFatura.innerHTML = "";
}
