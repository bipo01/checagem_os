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
			const valor = Number(formattedNameArr[2].trim().split(".")[0].replaceAll(".", "").replaceAll(",", "."));
			return { numeroOS, tipo, valor, origem: "Pasta" };
		});
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
		const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vTfM0nGoCsDmmp0W15By-T3GP9ncKCtTDSQ2XHgnQHnLQVpjZqQAXe42NpsMIRd9-UkxH34g8y2zo3Q/pub?gid=0&single=true&output=csv");

		const csvText = await response.text();

		const parsed = Papa.parse(csvText, {
			header: false,
			skipEmptyLines: true,
		});

		dataGS = parsed.data.slice(1);

		headerGS = {};

		parsed.data[0].forEach((col, i) => (headerGS[`${col}`] = i));

		const filteredData = dataGS.filter((row) => row[headerGS["Mês de Finalização"]] == mesFinalizacaoGS.value && row[headerGS["Ano de Finalização"]] == anoFinalizacaoGS.value);
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

		const todasOSs = [...new Set([...(nfsGS?.map((el) => el.numeroOS) ?? []), ...(nfsPastaArr?.map((el) => el.numeroOS) ?? [])])].sort((a, b) => {
			return Number(a) - Number(b);
		});

		const origens = ["GS", "Pasta", "Fatura"];

		todasOSs.forEach((os) => {
			const todasNFs = [...(nfsGS?.filter((nf) => nf.numeroOS == os) ?? []), ...(nfsPastaArr?.filter((nf) => nf.numeroOS == os) ?? [])].sort((a, b) => {
				const order = { P: 1, M: 2 };
				return order[a.tipo] - order[b.tipo];
			});

			const todasMO = todasNFs.filter((nf) => nf.tipo === "M");
			const todasPC = todasNFs.filter((nf) => nf.tipo === "P");

			if (todasMO.length > 0) {
				resultado.querySelector(".numeroOS").insertAdjacentHTML("beforeend", `<h3>${os}</h3>`);

				const obj = origens.map((orig) => {
					const nf = todasMO.find((el) => el.origem === orig);
					if (!nf) return { numeroOS: os, tipo: "-", valor: "-", origem: orig };
					return nf;
				});

				obj.forEach((nf) => {
					resultado.querySelector(`.tipo${nf.origem}`).insertAdjacentHTML("beforeend", `<h3>${nf.tipo}</h3>`);
					resultado.querySelector(`.valor${nf.origem}`).insertAdjacentHTML("beforeend", `<h3>${nf.valor}</h3>`);
				});
			}

			if (todasPC.length > 0) {
				resultado.querySelector(".numeroOS").insertAdjacentHTML("beforeend", `<h3>${os}</h3>`);

				const obj = origens.map((orig) => {
					const nf = todasPC.find((el) => el.origem === orig);
					if (!nf) return { numeroOS: os, tipo: "-", valor: "-", origem: orig };
					return nf;
				});

				obj.forEach((nf) => {
					resultado.querySelector(`.tipo${nf.origem}`).insertAdjacentHTML("beforeend", `<h3>${nf.tipo}</h3>`);
					resultado.querySelector(`.valor${nf.origem}`).insertAdjacentHTML("beforeend", `<h3>${nf.valor}</h3>`);
				});
			}
		});
	}
});
