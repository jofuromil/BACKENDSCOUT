import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";


const ObjetivosScoutPanel = () => {
  const { scoutId } = useParams();
  const token = localStorage.getItem("token");
  const usuarioId = scoutId || localStorage.getItem("usuarioId");

  const [resumen, setResumen] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [aprobados, setAprobados] = useState([]);
  const [nombreScout, setNombreScout] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    console.log("🟨 usuarioId:", usuarioId);
    const fetchData = async () => {
      try {
        if (scoutId) {
          const resUsuario = await axios.get(`/api/users/${scoutId}`, config);
          setNombreScout(resUsuario.data.nombreCompleto);
        }

        const resResumen = await axios.get(
          `/api/Objetivo/resumen-scout?usuarioId=${usuarioId}`,
          config
        );
        const resPendientes = await axios.get(
          `/api/Objetivo/pendientes-scout-dto?usuarioId=${usuarioId}`,
          config
        );
        const resAprobados = await axios.get(
          `/api/Objetivo/historial?usuarioId=${usuarioId}&soloValidados=true`,
          config
        );

        setResumen(resResumen.data);
        setPendientes(resPendientes.data);
        setAprobados(resAprobados.data);
      } catch (err) {
        console.error("❌ Error:", err);
        setError("No se pudieron cargar los objetivos.");
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [usuarioId]);

  if (cargando) return <div className="p-4">⏳ Cargando objetivos...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div
              className="min-h-screen text-gray-800 flex flex-col pb-24 pt-4"
              style={{
                backgroundImage: `url(${fondoScout})`,
                backgroundRepeat: "repeat",
                backgroundSize: "contain"
              }}
            >
    <div className="min-h-screen pb-20 relative">
      {/* Menú fijo superior */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-20">
        {nombreScout && (
          <h1 className="text-xl font-semibold text-center text-gray-800 mb-4">
            Objetivos de: <span className="text-blue-700">{nombreScout}</span>
          </h1>
        )}

        <div className="space-y-8">
          {/* ✅ RESUMEN */}
          <section>
            <h2 className="text-xl font-bold text-blue-800 mb-3">📊 Resumen de Objetivos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded">
                <thead className="bg-blue-100 text-blue-800">
                  <tr>
                    <th className="px-4 py-2 text-left">Nivel</th>
                    <th className="px-4 py-2 text-left">Área</th>
                    <th className="px-4 py-2 text-center">Total</th>
                    <th className="px-4 py-2 text-center">Validados</th>
                    <th className="px-4 py-2 text-center">Pendientes</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((item, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{item.nivelProgresion || "—"}</td>
                      <td className="px-4 py-2">{item.areaCrecimiento}</td>
                      <td className="px-4 py-2 text-center">{item.total}</td>
                      <td className="px-4 py-2 text-center">{item.validados}</td>
                      <td className="px-4 py-2 text-center">{item.pendientes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 🕒 Pendientes */}
          <section>
            <h2 className="text-xl font-bold text-yellow-600 mb-3">🕒 Pendientes de Aprobación</h2>
            {Array.isArray(pendientes) && pendientes.length > 0 ? (
              <ul className="space-y-2">
                {pendientes.map((obj, i) => (
                  <li key={i} className="bg-yellow-100 p-3 rounded shadow">
                    <strong>{obj.areaCrecimiento || "Área no definida"}</strong>:{" "}
{obj.descripcion || "Sin descripción"}
                    <p className="text-sm text-gray-600 mt-1">
                      Selección: {obj.fechaSeleccion ? new Date(obj.fechaSeleccion).toLocaleDateString() : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay objetivos pendientes.</p>
            )}
          </section>

          {/* ✅ Aprobados */}
          <section>
            <h2 className="text-xl font-bold text-green-700 mb-3">✅ Aprobados</h2>
            {Array.isArray(aprobados) && aprobados.length > 0 ? (
              <ul className="space-y-2">
                {aprobados.map((obj, i) => (
                  <li key={i} className="bg-green-100 p-3 rounded shadow">
                    <strong>{obj.area || "Área no definida"}</strong>: {obj.descripcion || "Sin descripción"}
                    <p className="text-sm text-gray-600 mt-1">
                      📅 Selección: {obj.fechaSeleccion ? new Date(obj.fechaSeleccion).toLocaleDateString() : "—"} • 
                      Aprobación: {obj.fechaValidacion ? new Date(obj.fechaValidacion).toLocaleDateString() : "—"} • 
                      👤 Aprobado por: {obj.dirigenteValidador || "—"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay objetivos aprobados aún.</p>
            )}
          </section>
        </div>
      </div>
  </div>

      {/* Menú fijo inferior en móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
  
  );
};

export default ObjetivosScoutPanel;
