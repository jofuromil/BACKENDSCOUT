import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

function MiembrosScoutsUnidad() {
  const [scouts, setScouts] = useState([]);
  const token = localStorage.getItem("token");
  const [dirigenteId, setDirigenteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarScouts();
  }, []);

  const cargarScouts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const id = response.data.id;
      setDirigenteId(id);

      const resMiembros = await axios.get(
        `http://localhost:8080/api/users/miembros-unidad/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filtrar solo scouts
      const soloScouts = resMiembros.data.filter((m) => m.tipo === "Scout");
      setScouts(soloScouts);
    } catch (error) {
      console.error("Error al cargar scouts de la unidad", error);
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
      {/* Menú fijo superior en escritorio */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">🧭 Scouts de la Unidad</h1>
          {scouts.length === 0 ? (
            <p>No hay scouts registrados en la unidad.</p>
          ) : (
            <ul className="divide-y divide-gray-300">
              {scouts.map((scout) => (
                <li key={scout.id} className="py-3 flex flex-wrap gap-2 justify-between items-center">
                  <div>
                    <p className="font-medium">{scout.nombreCompleto}</p>
                    <p className="text-sm text-gray-500">{scout.rama}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dirigente/objetivos-scout/${scout.id}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                    >
                      Ver Objetivos
                    </button>
                    <button
                      onClick={() => navigate(`/dirigente/kardex/${scout.id}`)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      Ver Kardex
                    </button>
                    <button
                      onClick={() => navigate(`/dirigente/perfil-scout/${scout.id}`)}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Ver Perfil
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Menú fijo inferior en móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}

export default MiembrosScoutsUnidad;
