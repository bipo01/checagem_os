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
});
