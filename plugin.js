export default function activate(api) {
  api.menu.add("Tools", {
    label: "Export Tileset Atlas PNG",
    run: async () => {
      const data = api.tileset.raw();

      if (!data || !data.atlas || !data.atlas.image) {
        alert("No se ha podido obtener el atlas del tileset.");
        return;
      }

      const image = data.atlas.image;

      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          alert("No se ha podido crear el PNG.");
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "Installation-tileset-atlas.png";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
      }, "image/png");
    }
  });
}