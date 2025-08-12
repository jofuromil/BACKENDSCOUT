import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function ValidarEspecialidadScout() {
  const { scoutId } = useParams();
  const token = localStorage.getItem("token");
  const [agrupado, setAgrupado] = useState({});

  useEffect(() => {
    cargarAvances();
  }, [scoutId, token]);

  const cargarAvances = async () => {
    try {
      const res = await fetch(`/api/especialidades/avance-scout?scoutId=${scoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const agrupadoPorEspecialidad = {};
      data.forEach((r) => {
        const nombre = r.especialidadNombre;
        if (!agrupadoPorEspecialidad[nombre]) {
          agrupadoPorEspecialidad[nombre] = [];
        }
        agrupadoPorEspecialidad[nombre].push(r);
      });

      setAgrupado(agrupadoPorEspecialidad);
    } catch (err) {
      console.error("Error al cargar avances", err);
    }
  };

  const validarRequisito = async (cumplidoId) => {
    const confirm = window.confirm("¿Deseas aprobar este requisito?");
    if (!confirm) return;

    try {
      await fetch("/api/Especialidades/validar-requisito", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cumplidoId, aprobado: true }),
      });

      await cargarAvances();
    } catch (err) {
      alert("Error al validar requisito");
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
    <div className="min-h-screen text-gray-800 pb-20">
      {/* Menú superior fijo para pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-4xl mx-auto mt-6 px-4">
        <h2 className="text-2xl font-bold mb-6">Especialidades del Scout</h2>

        {Object.keys(agrupado).length === 0 ? (
          <p>Este scout no tiene requisitos para validar.</p>
        ) : (
          Object.entries(agrupado).map(([nombre, requisitos]) => (
            <div key={nombre} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{nombre}</h3>
              <ul className="space-y-2">
                {requisitos.map((r) => (
                  <li
                    key={r.cumplidoId}
                    className="p-3 border rounded bg-white shadow flex justify-between items-center"
                  >
                    <span>{r.texto}</span>
                    <button
                      onClick={() => validarRequisito(r.cumplidoId)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Validar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* Menú inferior fijo para móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}
