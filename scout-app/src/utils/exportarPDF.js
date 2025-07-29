import html2pdf from "html2pdf.js";

export const exportarPDF = (elementId, fileName) => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error("No se encontró el elemento con ID:", elementId);
    return;
  }

  // Clona el contenido para usarlo en una ventana aparte
  const clonedContent = element.cloneNode(true);

  // Crea una ventana emergente (puede ser oculta o pequeña)
  const printWindow = window.open("", "_blank", "width=800,height=600");

  if (!printWindow) {
    console.error("No se pudo abrir la ventana emergente");
    return;
  }

  // Inserta el contenido HTML y espera a que cargue
  printWindow.document.open();
  printWindow.document.write(`
    <html>
      <head>
        <title>${fileName}</title>
        <link rel="stylesheet" href="/src/index.css">
      </head>
      <body>${clonedContent.outerHTML}</body>
    </html>
  `);
  printWindow.document.close();

  // Espera a que se renderice y luego exporta desde la nueva ventana
  printWindow.onload = () => {
    const exportElement = printWindow.document.body;

    const opt = {
      margin: 0.5,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(exportElement)
      .save()
      .then(() => {
        printWindow.close(); // Cierra la ventana después de guardar
      })
      .catch((err) => {
        console.error("Error al exportar PDF:", err);
        printWindow.close();
      });
  };
};

