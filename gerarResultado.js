document.addEventListener("click", async (e) => {
  const element = e.target;

  if (element.id === "coletarDadosGS") {
    resetUI();

    await getDataGS();
    filterDataGS();

    insertTotals(nfsGS, "Planilha de Controle de O.Ss (PJC)", totalGS);
    insertTotals(nfsPastaArr, "NFs baixadas", totalPasta);
    insertTotals(nfsFatura, "Fatura", totalFatura);

    const totaisSet = [
      ...new Set(
        [...document.querySelectorAll(".spanTotal")].map((el) =>
          toNumberBR(el.textContent)
        )
      ),
    ];
    if (totaisSet.length > 1) {
      nfsGS?.length && totalGS.classList.add("totalDiferente");
      nfsPastaArr?.length && totalPasta.classList.add("totalDiferente");
      nfsFatura?.length && totalFatura.classList.add("totalDiferente");
    } else {
      totalGS.classList.remove("totalDiferente");
      totalPasta.classList.remove("totalDiferente");
      totalFatura.classList.remove("totalDiferente");
    }

    const todasOSs = [
      ...new Set([
        ...(nfsGS?.map((el) => el.numeroOS) ?? []),
        ...(nfsPastaArr?.map((el) => el.numeroOS) ?? []),
        ...(nfsFatura?.map((el) => el.numeroOS) ?? []),
      ]),
    ].sort((a, b) => {
      return Number(a) - Number(b);
    });

    const origens = ["GS", "Pasta", "Fatura"];

    todasOSs.forEach((os) => {
      const todasNFs = [
        ...(nfsGS?.filter((nf) => nf.numeroOS == os) ?? []),
        ...(nfsPastaArr?.filter((nf) => nf.numeroOS == os) ?? []),
        ...(nfsFatura?.filter((nf) => nf.numeroOS == os) ?? []),
      ].sort((a, b) => {
        const order = { P: 1, M: 2 };
        return order[a.tipo] - order[b.tipo];
      });

      const todasMO = todasNFs.filter((nf) => nf.tipo === "M");
      const todasPC = todasNFs.filter((nf) => nf.tipo === "P");
      const finalizada =
        nfsGS
          .find((nf) => nf.numeroOS === os)
          ?.status?.trim()
          .toUpperCase() === "FINALIZADA"
          ? true
          : false;

      if (todasMO.length > 0) {
        resultado
          .querySelector(".numeroOS")
          .insertAdjacentHTML(
            "beforeend",
            `<h3 ${
              !finalizada
                ? "class='nFinalizada' title='Não está finalizada'"
                : ""
            } >${os}</h3>`
          );

        const obj = origens.map((orig) => {
          const nf = todasMO.find((el) => el.origem === orig);
          if (!nf) return { numeroOS: os, tipo: "-", valor: "-", origem: orig };
          return nf;
        });
        const valoresDiferentes = [
          ...new Set(obj.map((el) => el.valor)),
        ].filter((el) => el !== "-");

        if (valoresDiferentes.length > 1) {
          document
            .querySelectorAll(".numeroOS h3")
            [
              document.querySelectorAll(".numeroOS h3").length - 1
            ].classList.add("valoresDiferentes");
        }

        writeResult(obj, valoresDiferentes);
      }

      if (todasPC.length > 0) {
        resultado
          .querySelector(".numeroOS")
          .insertAdjacentHTML(
            "beforeend",
            `<h3  ${
              !finalizada
                ? "class='nFinalizada' title='Não está finalizada'"
                : ""
            } >${os}</h3>`
          );

        const obj = origens.map((orig) => {
          const nf = todasPC.find((el) => el.origem === orig);
          if (!nf) return { numeroOS: os, tipo: "-", valor: "-", origem: orig };
          return nf;
        });

        const valoresDiferentes = [
          ...new Set(obj.map((el) => el.valor)),
        ].filter((el) => el !== "-");

        if (valoresDiferentes.length > 1) {
          document
            .querySelectorAll(".numeroOS h3")
            [
              document.querySelectorAll(".numeroOS h3").length - 1
            ].classList.add("valoresDiferentes");
        }

        writeResult(obj, valoresDiferentes);
      }
    });
  }
});
