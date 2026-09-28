export default function activate(api) {
  api.menu.add("Tools", {
    label: "Export Tileset Atlas PNG",
    run: async () => {
      try {
        // Cargar los gráficos del tileset actual
        const loaded = await api.tileset.load();

        if (!loaded) {
          await api.ui.alert(
            "No se han podido cargar los gráficos del tileset.\n\n" +
            "Comprueba que los Game Data de StarCraft están instalados en scmJS."
          );
          return;
        }

        // Obtener los datos decodificados del tileset
        const data = api.tileset.raw();

        if (!data || !data.atlas || !data.atlas.image) {
          await api.ui.alert(
            "scmJS no ha podido generar el atlas del tileset."
          );
          return;
        }

        const atlas = data.atlas;
        const source = atlas.image;

        // Crear un canvas con exactamente el tamaño del atlas
        const canvas = document.createElement("canvas");
        canvas.width = source.width;
        canvas.height = source.height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          await api.ui.alert("No se ha podido crear el canvas.");
          return;
        }

        // Mantener el pixel art sin suavizado
        ctx.imageSmoothingEnabled = false;

        // Copiar el atlas completo
        ctx.drawImage(source, 0, 0);

        // Convertirlo a PNG
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
          await api.ui.alert("No se ha podido generar el archivo PNG.");
          return;
        }

        // Guardar mediante el sistema de archivos de scmJS
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
}
