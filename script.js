const mesFinalizacaoGS = document.querySelector("#mesFinalizacaoGS");
const anoFinalizacaoGS = document.querySelector("#anoFinalizacaoGS");

const nfsPasta = document.querySelector("#nfsPasta");

const resultado = document.querySelector("#resultado");

let nfsPastaArr;
let nfsGS = [];
let dataGS;
let headerGS;

nfsPasta.addEventListener("change", () => {
  nfsPastaArr = [...nfsPasta.files]
    .map((file) => file.name)
    .map((name) => {
      const formattedNameArr = name.split("-");
      const numeroOS = formattedNameArr[0].trim().split(" ").at(-1);
      const tipo = formattedNameArr[1].toUpperCase().includes("P") ? "P" : "M";
      const valor = Number(
        formattedNameArr[2]
          .trim()
          .split(".")[0]
          .replaceAll(".", "")
          .replaceAll(",", ".")
      );
      return { numeroOS, tipo, valor, origem: "Pasta" };
    });

  console.log(nfsPastaArr);
});

document.addEventListener("click", async (e) => {
  const element = e.target;

  if (element.id === "coletarDadosGS") {
    resultado.querySelector(`.numeroOS`).innerHTML = "";
    resultado.querySelector(`.tipoGS`).innerHTML = "";
    resultado.querySelector(`.tipoPasta`).innerHTML = "";
    resultado.querySelector(`.tipoFatura`).innerHTML = "";
    resultado.querySelector(`.valorGS`).innerHTML = "";
    resultado.querySelector(`.valorPasta`).innerHTML = "";
    resultado.querySelector(`.valorFatura`).innerHTML = "";
    nfsGS = [];
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
      if (toNumberBR(row[headerGS["Peças"]]) > 0) {
        tipo = "P";
        valor = toNumberBR(row[headerGS["Peças"]]);
        nfsGS.push({ numeroOS, tipo, valor, origem: "GS" });
      }

      if (toNumberBR(row[headerGS["Mão de Obra"]]) > 0) {
        tipo = "M";
        valor = toNumberBR(row[headerGS["Mão de Obra"]]);
        nfsGS.push({ numeroOS, tipo, valor, origem: "GS" });
      }
    });

    const todasOSs = [
      ...new Set([
        ...(nfsGS?.map((el) => el.numeroOS) ?? []),
        ...(nfsPastaArr?.map((el) => el.numeroOS) ?? []),
      ]),
    ].sort((a, b) => {
      return Number(a) - Number(b);
    });

    todasOSs.forEach((os) => {
      const todasNFs = [
        ...(nfsGS?.filter((nf) => nf.numeroOS == os) ?? []),
        ...(nfsPastaArr?.filter((nf) => nf.numeroOS == os) ?? []),
      ].sort((a, b) => {
        const order = { P: 1, M: 2 };
        return order[a.tipo] - order[b.tipo];
      });

      ["M", "P"].forEach((tipo) => {
        const nfsGS = todasNFs.filter(
          (n) => n.tipo === tipo && n.origem === "GS"
        );
        const nfsPasta = todasNFs.filter(
          (n) => n.tipo === tipo && n.origem === "Pasta"
        );
        const nfsFatura = todasNFs.filter(
          (n) => n.tipo === tipo && n.origem === "Fatura"
        );

        // Se nenhuma origem tem esse tipo, pula
        if (
          nfsGS.length === 0 &&
          nfsPasta.length === 0 &&
          nfsFatura.length === 0
        )
          return;

        // Linha
        resultado
          .querySelector(".numeroOS")
          .insertAdjacentHTML("beforeend", `<h3>${os}</h3>`);

        // GS
        if (nfsGS.length > 0) {
          resultado
            .querySelector(".tipoGS")
            .insertAdjacentHTML("beforeend", `<h3>${tipo}</h3>`);
          resultado
            .querySelector(".valorGS")
            .insertAdjacentHTML("beforeend", `<h3>R$ ${nfsGS[0].valor}</h3>`);
        } else {
          resultado
            .querySelector(".tipoGS")
            .insertAdjacentHTML("beforeend", `<h3>-</h3>`);
          resultado
            .querySelector(".valorGS")
            .insertAdjacentHTML("beforeend", `<h3>-</h3>`);
        }

        // Pasta
        if (nfsPasta.length > 0) {
          resultado
            .querySelector(".tipoPasta")
            .insertAdjacentHTML("beforeend", `<h3>${tipo}</h3>`);
          resultado
            .querySelector(".valorPasta")
            .insertAdjacentHTML(
              "beforeend",
              `<h3>R$ ${nfsPasta[0].valor}</h3>`
            );
        } else {
          resultado
            .querySelector(".tipoPasta")
            .insertAdjacentHTML("beforeend", `<h3>-</h3>`);
          resultado
            .querySelector(".valorPasta")
            .insertAdjacentHTML("beforeend", `<h3>-</h3>`);
        }

        // Fatura
        if (nfsFatura.length > 0) {
          resultado
            .querySelector(".tipoFatura")
            .insertAdjacentHTML("beforeend", `<h3>${tipo}</h3>`);
          resultado
            .querySelector(".valorFatura")
            .insertAdjacentHTML(
              "beforeend",
              `<h3>R$ ${nfsFatura[0].valor}</h3>`
            );
        } else {
          resultado
            .querySelector(".tipoFatura")
            .insertAdjacentHTML("beforeend", `<h3>-</h3>`);
          resultado
            .querySelector(".valorFatura")
            .insertAdjacentHTML("beforeend", `<h3>-</h3>`);
        }
      });
    });
  }
});
