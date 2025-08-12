import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuFijo from "../../components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function EspecialidadesDirigentePanel() {
  const [scouts, setScouts] = useState([]);
  const token = localStorage.getItem("token");
  const unidadId = localStorage.getItem("unidadId");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/especialidades/scouts-con-avance?unidadId=${unidadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setScouts)
      .catch((err) => console.error("Error al cargar scouts", err));
  }, [unidadId, token]);

  const verEspecialidades = (scoutId) => {
    navigate(`/dirigente/especialidades/${scoutId}`);
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
    <div className="min-h-screen text-gray-800 flex flex-col pb-20">
      {/* Menú fijo superior en pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-2xl mx-auto mt-1 px-4">
        <h2 className="text-2xl font-bold mb-4">Validar Especialidades</h2>

        {scouts.length === 0 ? (
          <p>No hay avances pendientes por validar.</p>
        ) : (
          <ul className="space-y-3">
            {scouts.map((s) => (
              <li
                key={s.id}
                className=" bg-white p-8 px-20 border rounded-xl shadow flex justify-between items-start"
              >
                <div>
                  <div className="font-semibold">{s.nombreCompleto}</div>
                  <div className="text-sm text-gray-600">Rama: {s.rama}</div>
                </div>
                <button
                  onClick={() => verEspecialidades(s.id)}
                  className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full hover:bg-purple-100 transition"
                >
                  Ver especialidades
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
