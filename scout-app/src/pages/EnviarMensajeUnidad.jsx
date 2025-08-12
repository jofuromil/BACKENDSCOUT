import { useState } from "react";
import axios from "axios";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

function EnviarMensajeUnidad() {
  const [contenido, setContenido] = useState("");
  const [imagen, setImagen] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [mensajeRespuesta, setMensajeRespuesta] = useState("");

  const enviarMensaje = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("contenido", contenido);
    if (imagen) formData.append("imagen", imagen);
    if (archivo) formData.append("archivo", archivo);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8080/api/mensajes/con-adjunto", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setMensajeRespuesta("✅ Mensaje enviado con éxito");
      setContenido("");
      setImagen(null);
      setArchivo(null);
    } catch (error) {
      setMensajeRespuesta("❌ Error al enviar el mensaje");
    }
  };

  return (
    <div
          className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
          style={{
            backgroundImage: `url(${fondoScout})`,
            backgroundRepeat: "repeat",
            backgroundSize: "contain"
          }}
        >
    <div className="min-h-screen pb-20">
      {/* Menú fijo superior (pantallas grandes) */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto pt-6 px-4">
        <div className=" rounded shadow">
          <h2 className="text-2xl font-bold mb-4">📤 Enviar Mensaje a la Unidad</h2>

          {mensajeRespuesta && (
            <div className="mb-4 text-center font-semibold">
              {mensajeRespuesta}
            </div>
          )}

          <form onSubmit={enviarMensaje}>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Contenido del mensaje</label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
                className=" bg-white w-full border rounded p-2"
                rows={4}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">📷 Imagen (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
                className="text-blue-500 w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">📎 Archivo adjunto (opcional)</label>
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
                className="text-blue-500 w-full"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>

      {/* Menú fijo inferior (móviles) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}

export default EnviarMensajeUnidad;
