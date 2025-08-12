import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuFijoGrupo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function VerMensajesGrupo() {
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const grupoId = localStorage.getItem("grupoId");
  const token = localStorage.getItem("token");

  const obtenerMensajes = async () => {
    try {
      const url = `http://localhost:8080/api/mensajegrupo/grupo/${grupoId}/mis-mensajes`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMensajes(res.data);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerMensajes();
  }, [grupoId, token]);

  return (
    <div
          className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
          style={{
            backgroundImage: `url(${fondoScout})`,
            backgroundRepeat: "repeat",
            backgroundSize: "contain"
          }}
        >
    <div className="min-h-screen text-black flex flex-col pb-24">
      {/* Menú fijo superior en escritorio */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijoGrupo />
      </div>

      <div className="p-4 flex-grow">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Mensajes del Grupo Scout
        </h2>

        {cargando ? (
          <p className="text-center">Cargando mensajes...</p>
        ) : mensajes.length === 0 ? (
          <p className="text-center text-gray-600">No hay mensajes disponibles.</p>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className="border rounded p-4 shadow bg-gray-50 flex flex-col gap-2"
              >
                <div className="text-sm text-gray-500">
                  <span className="font-semibold">{m.remitente?.nombreCompleto}</span>{" "}
                  — {new Date(m.fechaEnvio).toLocaleString()} — Para: {m.destinatarios}
                </div>
                <div className="text-lg">{m.contenido}</div>

                {m.urlImagen && (
                  <div>
                    <img
                      src={`http://localhost:8080/archivos/${m.urlImagen
                        .split("/")
                        .slice(-2)
                        .join("/")}`}
                      alt="Imagen del mensaje"
                      className="max-w-full rounded"
                    />
                  </div>
                )}

                {m.urlArchivo && (
                  <div>
                    <a
                      href={`http://localhost:8080/archivos/${m.urlArchivo
                        .split("/")
                        .slice(-2)
                        .join("/")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver archivo adjunto
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menú fijo inferior en móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijoGrupo />
      </div>
    </div>
    </div>
  );
}
