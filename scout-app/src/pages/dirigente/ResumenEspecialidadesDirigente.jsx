import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuFijo from "../../components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

export default function EspecialidadesResumenDirigente() {
  const [scouts, setScouts] = useState([]);
  const token = localStorage.getItem("token");
  const unidadId = localStorage.getItem("unidadId");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/especialidades/resumen-por-scout?unidadId=${unidadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setScouts)
      .catch((err) => console.error("Error al cargar resumen", err));
  }, [unidadId, token]);

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
      {/* Menú fijo superior para pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-4xl mx-auto mt-6 px-4">
        <h2 className="text-2xl font-bold mb-6">Resumen de Especialidades por Scout</h2>

        {scouts.length === 0 ? (
          <p>No hay datos de especialidades para mostrar.</p>
        ) : (
          scouts.map((scout) => (
            <div key={scout.scoutId} className=" bg-white mb-8">
              <h3 className="font-semibold text-lg mb-2">{scout.nombreCompleto}</h3>
              {scout.especialidades.length === 0 ? (
                <p className="text-sm text-gray-600">Sin especialidades aún.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded shadow text-sm">
                    <thead className="bg-purple-100 text-purple-800">
                      <tr>
                        <th className="px-4 py-2 text-left">Especialidad</th>
                        <th className="px-4 py-2 text-center">Seleccionados</th>
                        <th className="px-4 py-2 text-center">Aprobados</th>
                        <th className="px-4 py-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scout.especialidades.map((esp) => (
                        <tr key={esp.especialidadId} className="border-t">
                          <td className="px-4 py-2">{esp.nombre}</td>
                          <td className="px-4 py-2 text-center">{esp.seleccionados}</td>
                          <td className="px-4 py-2 text-center">{esp.aprobados}</td>
                          <td className="px-4 py-2 text-center">
                            {esp.cumplida ? (
                              <span className="text-green-600 font-semibold">✔ Completada</span>
                            ) : (
                              <span className="text-yellow-600">En proceso</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
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

