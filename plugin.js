export default function activate(api) {

  // ============================================================
  // FUNCIÓN AUXILIAR: guardar Canvas como PNG
  // ============================================================

  async function canvasToBlob(canvas) {
    return await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
  }


  // ============================================================
  // 1. EXPORTAR ATLAS ORIGINAL DE SCMJS
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

        const blob = await canvasToBlob(canvas);

        if (!blob) {
          await api.ui.alert(
            "No se ha podido generar el archivo PNG."
          );
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
  // 2. EXPORTAR LISTA DE DOODADS
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
            "No se han podido obtener los doodads."
          );
          return;
        }

        const doodads = data.doodads.doodads;

        let text = "";

        text += `Tileset: ${data.name}\n`;
        text += `Doodads encontrados: ${doodads.length}\n`;
        text += "\n";

        doodads.forEach((doodad, index) => {

          text += `Doodad #${index}\n`;
          text += `ID: ${doodad.id}\n`;
          text += `Group: ${doodad.group}\n`;
          text += `Category: ${doodad.category}\n`;
          text += `Width: ${doodad.width}\n`;
          text += `Height: ${doodad.height}\n`;
          text += `Ramp: ${doodad.ramp ? "YES" : "NO"}\n`;

          if (doodad.overlay) {

            text +=
              `Overlay: ${doodad.overlay.kind} ` +
              `${doodad.overlay.id}\n`;

          } else {

            text += "Overlay: none\n";

          }

          text += `Tiles: ${Array.from(doodad.tiles).join(", ")}\n`;
          text += `Required: ${Array.from(doodad.required).join(", ")}\n`;

          text += "\n";

        });

        const blob = new Blob(
          [text],
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
            detail: `${doodads.length} doodads encontrados.`
          });

        }

      } catch (error) {

        console.error(error);

        await api.ui.alert(
          "Error al exportar los doodads.\n\n" +
          String(error)
        );

      }

    }

  });


  // ============================================================
  // 3. EXPORTAR LOS DOODADS COMO PNG INDIVIDUALES
  // ============================================================

  api.menu.add("Tools", {
    label: "Export Doodads PNG",

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
            "No se han podido obtener los doodads."
          );
          return;
        }

        const doodads = data.doodads.doodads;

        let exported = 0;

        for (const doodad of doodads) {

          const image = api.graphics.doodadImage(doodad.id);

          if (!image || !image.image) {
            console.warn(
              `No se pudo obtener el doodad ${doodad.id}`
            );
            continue;
          }

          const canvas = document.createElement("canvas");

          canvas.width = image.width;
          canvas.height = image.height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            continue;
          }

          ctx.imageSmoothingEnabled = false;

          ctx.drawImage(
            image.image,
            0,
            0
          );

          const blob = await canvasToBlob(canvas);

          if (!blob) {
            continue;
          }

          const category =
            doodad.category
              .replace(/[^a-zA-Z0-9_-]/g, "_");

          const rampText =
            doodad.ramp ? "_Ramp" : "";

          const filename =
            `${data.name}_Doodad_${doodad.id}_` +
            `${category}${rampText}.png`;

          const result = await api.ui.saveFile(
            blob,
            filename
          );

          if (result) {
            exported++;
          }

        }

        api.ui.toast({
          kind: "ok",
          title: "Doodads exportados",
          detail: `Listo: ${exported} doodads exportados.`
        });

      } catch (error) {

        console.error(error);

        await api.ui.alert(
          "Error al exportar los doodads.\n\n" +
          String(error)
        );

      }

    }

  });


  // ============================================================
  // 4. EXPORTAR ATLAS PARA GODOT ×2
  // ============================================================

  api.menu.add("Tools", {
    label: "Export Godot Tileset PNG x2",

    run: async () => {

      try {

        // --------------------------------------------------------
        // Cargar los gráficos
        // --------------------------------------------------------

        const loaded = await api.tileset.load();

        if (!loaded) {

          await api.ui.alert(
            "No se han podido cargar los gráficos del tileset.\n\n" +
            "Comprueba que los Game Data de StarCraft están instalados."
          );

          return;
        }


        // --------------------------------------------------------
        // Obtener datos del tileset
        // --------------------------------------------------------

        const data = api.tileset.raw();

        if (!data || !data.tileset) {

          await api.ui.alert(
            "No se han podido obtener los datos del tileset."
          );

          return;
        }

        const tileCount =
          data.tileset.megatileCount;


        if (!tileCount || tileCount <= 0) {

          await api.ui.alert(
            "El tileset no contiene megatiles."
          );

          return;
        }


        // --------------------------------------------------------
        // CONFIGURACIÓN DEL ATLAS
        // --------------------------------------------------------

        // Cada megatile original = 32×32
        // Lo queremos a 64×64 para nuestro juego.

        const ORIGINAL_TILE_SIZE = 32;
        const OUTPUT_TILE_SIZE = 64;

        const SCALE = 2;

        // Número de columnas del nuevo atlas.
        //
        // 32 columnas × 64 px = 2048 px de ancho.
        //
        // Esto produce un atlas bastante manejable
        // para Godot.

        const COLUMNS = 32;

        const ROWS =
          Math.ceil(tileCount / COLUMNS);


        // --------------------------------------------------------
        // Crear el canvas final
        // --------------------------------------------------------

        const canvas =
          document.createElement("canvas");

        canvas.width =
          COLUMNS * OUTPUT_TILE_SIZE;

        canvas.height =
          ROWS * OUTPUT_TILE_SIZE;


        const ctx =
          canvas.getContext("2d");

        if (!ctx) {

          await api.ui.alert(
            "No se ha podido crear el canvas."
          );

          return;
        }


        // --------------------------------------------------------
        // Configuración pixel-perfect
        // --------------------------------------------------------

        ctx.imageSmoothingEnabled = false;


        // --------------------------------------------------------
        // Exportar todos los megatiles
        // --------------------------------------------------------

        let exported = 0;

        for (
          let tileId = 0;
          tileId < tileCount;
          tileId++
        ) {

          const image =
            api.graphics.tileImage(tileId);


          if (!image || !image.image) {

            console.warn(
              `No se pudo obtener el megatile ${tileId}`
            );

            continue;
          }


          // Posición dentro del atlas

          const column =
            tileId % COLUMNS;

          const row =
            Math.floor(tileId / COLUMNS);

          const x =
            column * OUTPUT_TILE_SIZE;

          const y =
            row * OUTPUT_TILE_SIZE;


          // ------------------------------------------------------
          // Dibujar 32×32 → 64×64
          // ------------------------------------------------------

          ctx.drawImage(
            image.image,
            0,
            0,
            ORIGINAL_TILE_SIZE,
            ORIGINAL_TILE_SIZE,
            x,
            y,
            OUTPUT_TILE_SIZE,
            OUTPUT_TILE_SIZE
          );

          exported++;

        }


        // --------------------------------------------------------
        // Convertir a PNG
        // --------------------------------------------------------

        const blob =
          await canvasToBlob(canvas);


        if (!blob) {

          await api.ui.alert(
            "No se ha podido generar el PNG."
          );

          return;
        }


        // --------------------------------------------------------
        // Guardar
        // --------------------------------------------------------

        const filename =
          `${data.name}_Godot_Tileset_x2.png`;

        const result =
          await api.ui.saveFile(
            blob,
            filename
          );


        if (result) {

          api.ui.toast({
            kind: "ok",
            title: "Atlas para Godot creado",
            detail:
              `${exported}/${tileCount} megatiles · ` +
              `${canvas.width}×${canvas.height} px · ` +
              `tiles de 64×64`
          });

        }

      } catch (error) {

        console.error(error);

        await api.ui.alert(
          "Error al crear el atlas para Godot.\n\n" +
          String(error)
        );

      }

    }

  });

}
