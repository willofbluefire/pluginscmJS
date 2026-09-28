export default function activate(api) {
  // ============================================================
  // 1. EXPORTAR EL ATLAS COMPLETO
  // ============================================================

  api.menu.add("Tools", {
    label: "Export Tileset Atlas PNG",
    run: async () => {
      try {
        const loaded = await api.tileset.load();

        if (!loaded) {
          await api.ui.alert(
            "No se han podido cargar los gráficos del tileset.\n\n" +
            "Comprueba que los Game Data de StarCraft están instalados en scmJS."
          );
          return;
        }

        const data = api.tileset.raw();

        if (!data || !data.atlas || !data.atlas.image) {
          await api.ui.alert(
            "scmJS no ha podido generar el atlas del tileset."
          );
          return;
        }

        const atlas = data.atlas;
        const source = atlas.image;

        const canvas = document.createElement("canvas");
        canvas.width = source.width;
        canvas.height = source.height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          await api.ui.alert("No se ha podido crear el canvas.");
          return;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(source, 0, 0);

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
          await api.ui.alert("No se ha podido generar el archivo PNG.");
          return;
        }

        const result = await api.ui.saveFile(
          blob,
          `${data.name}-tileset-atlas.png`
        );

        if (result) {
          api.ui.toast({
            kind: "ok",
            title: "Atlas exportado",
            detail:
              `${data.name}: ${atlas.count} megatiles, ` +
              `${source.width}×${source.height} px.`
          });
        }
      } catch (error) {
        console.error(error);

        await api.ui.alert(
          "Se ha producido un error al exportar el atlas.\n\n" +
          String(error)
        );
      }
    }
  });


  // ============================================================
  // 2. EXPORTAR INFORMACIÓN DE LOS DOODADS
  // ============================================================

  api.menu.add("Tools", {
    label: "Export Tileset Doodads",
    run: async () => {
      try {
        const loaded = await api.tileset.load();

        if (!loaded) {
          await api.ui.alert(
            "No se han podido cargar los gráficos del tileset."
          );
          return;
        }

        const data = api.tileset.raw();

        if (!data || !data.doodads) {
          await api.ui.alert(
            "Este tileset no contiene datos de doodads."
          );
          return;
        }

        // IMPORTANTE:
        // data.doodads es un DoodadCatalogue.
        // El array real de doodads está dentro de .doodads
        const doodads = data.doodads.doodads;

        if (!doodads || !Array.isArray(doodads)) {
          await api.ui.alert(
            "No se ha encontrado la lista de doodads del tileset."
          );
          return;
        }

        // --------------------------------------------------------
        // Crear el informe
        // --------------------------------------------------------

        let output = "";

        output += `Tileset: ${data.name}\n`;
        output += `Doodads encontrados: ${doodads.length}\n\n`;

        doodads.forEach((doodad, index) => {
          output += `==============================\n`;
          output += `Doodad #${index}\n`;
          output += `==============================\n`;

          output += `ID: ${doodad.id}\n`;
          output += `Grupo: ${doodad.group}\n`;
          output += `Categoría: ${doodad.category}\n`;
          output += `Anchura: ${doodad.width}\n`;
          output += `Altura: ${doodad.height}\n`;
          output += `Rampa: ${doodad.ramp ? "SÍ" : "NO"}\n`;

          if (doodad.overlay) {
            output += `Overlay: ${doodad.overlay.kind}\n`;
            output += `Overlay ID: ${doodad.overlay.id}\n`;
          } else {
            output += `Overlay: ninguno\n`;
          }

          output += `Tiles: ${doodad.tiles.length}\n`;

          output += `Tiles: `;

          for (let i = 0; i < doodad.tiles.length; i++) {
            output += doodad.tiles[i];

            if (i < doodad.tiles.length - 1) {
              output += ", ";
            }
          }

          output += `\n`;

          output += `Required: `;

          for (let i = 0; i < doodad.required.length; i++) {
            output += doodad.required[i];

            if (i < doodad.required.length - 1) {
              output += ", ";
            }
          }

          output += `\n\n`;
        });

        // --------------------------------------------------------
        // Guardar informe
        // --------------------------------------------------------

        const blob = new Blob(
          [output],
          { type: "text/plain;charset=utf-8" }
        );

        const result = await api.ui.saveFile(
          blob,
          `${data.name}-doodads.txt`
        );

        if (result) {
          api.ui.toast({
            kind: "ok",
            title: "Doodads exportados",
            detail:
              `${doodads.length} doodads encontrados.`
          });
        }

      } catch (error) {
        console.error(error);

        await api.ui.alert(
          "Se ha producido un error al exportar los doodads.\n\n" +
          String(error)
        );
      }
    }
  });
}
