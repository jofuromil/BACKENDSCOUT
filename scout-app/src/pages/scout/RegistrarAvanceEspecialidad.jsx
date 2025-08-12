import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function RegistrarAvanceEspecialidad() {
  const [especialidades, setEspecialidades] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const rama = (localStorage.getItem("rama") || "").toUpperCase();

  useEffect(() => {
    fetch(`/api/Especialidades/rama?rama=${rama}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener especialidades");
        return res.json();
      })
      .then((data) => setEspecialidades(data))
      .catch((err) => console.error(err));
  }, [rama, token]);

  const verDetalle = (id) => {
    navigate(`/especialidades/${id}`);
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
      {/* Menú fijo superior en pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-3xl mx-auto pt-6 px-4">
        <h2 className="text-2xl font-bold mb-4">Registrar avance de especialidades</h2>

        {especialidades.length === 0 ? (
          <p>No hay especialidades registradas para tu rama.</p>
        ) : (
          <ul className="grid gap-3">
            {especialidades.map((esp) => (
              <li
                key={esp.id}
                className="p-4 border rounded bg-gray-50 shadow flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {esp.imagenUrl && (
                    <img
                      src={esp.imagenUrl}
                      alt={esp.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <span className="text-lg font-medium">{esp.nombre}</span>
                </div>
                <button
                  onClick={() => verDetalle(esp.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Ver
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Menú fijo inferior en móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}
