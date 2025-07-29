import React, { useState } from "react";
import axios from "axios";
import MenuFijoGrupo from "../../components/MenuFijoGrupo";

export default function EnviarMensajeGrupo() {
  const [contenido, setContenido] = useState("");
  const [destinatarios, setDestinatarios] = useState("TODOS");
  const [imagen, setImagen] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [mensajeEnviado, setMensajeEnviado] = useState(null);
  const grupoId = localStorage.getItem("grupoId");
  const token = localStorage.getItem("token");

  const enviarMensaje = async (e) => {
    e.preventDefault();

    if (!contenido.trim()) {
      alert("El mensaje no puede estar vacío.");
      return;
    }

    const formData = new FormData();
    formData.append("Contenido", contenido);
    formData.append("GrupoScoutId", parseInt(grupoId));
    formData.append("Destinatarios", destinatarios);
    if (imagen) formData.append("imagen", imagen);
    if (archivo) formData.append("archivo", archivo);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/mensajegrupo/enviar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMensajeEnviado("Mensaje enviado correctamente.");
      setContenido("");
      setImagen(null);
      setArchivo(null);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setMensajeEnviado("Hubo un error al enviar el mensaje.");
    }
  };

  return (
    <div className="min-h-screen pt-20 p-4 bg-white text-black">
      <MenuFijoGrupo />
      <h2 className="text-2xl font-bold mb-4 text-center">Enviar Mensaje al Grupo</h2>

      <form
        onSubmit={enviarMensaje}
        className="max-w-xl mx-auto p-4 border rounded shadow flex flex-col gap-4"
      >
        <label className="font-semibold">Mensaje:</label>
        <textarea
          className="border p-2 rounded"
          rows="5"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          required
        />

        <label className="font-semibold">Destinatarios:</label>
        <select
          value={destinatarios}
          onChange={(e) => setDestinatarios(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="TODOS">Todos</option>
          <option value="SCOUTS">Solo Scouts</option>
          <option value="DIRIGENTES">Solo Dirigentes</option>
        </select>

        <label className="font-semibold">Adjuntar imagen:</label>
        <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />

        <label className="font-semibold">Adjuntar archivo:</label>
        <input type="file" onChange={(e) => setArchivo(e.target.files[0])} />

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Enviar Mensaje
        </button>

        {mensajeEnviado && <p className="text-center text-green-700">{mensajeEnviado}</p>}
      </form>
    </div>
  );
}
