import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

export default function RegistrosGrupoDistrito() {
  const { grupoId } = useParams();
  const token = localStorage.getItem("token");

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [grupoNombre, setGrupoNombre] = useState("");

  // Totales
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [aprobados, setAprobados] = useState(0);
  const [enviadosNacional, setEnviadosNacional] = useState(0);

  const obtenerRegistros = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/registrogestion/registros-por-grupo/${grupoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const lista = res.data || [];
      setRegistros(lista);

      if (lista.length > 0) setGrupoNombre(lista[0].grupoNombre || "");
      else setGrupoNombre("");

      // Totales
      setTotalRegistros(lista.length);
      setAprobados(lista.filter((r) => r.aprobadoDistrito).length);
      setEnviadosNacional(lista.filter((r) => r.enviadoANacional).length);
    } catch (err) {
      console.error("Error al obtener registros del grupo:", err);
      setError("No se pudieron cargar los registros.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerRegistros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aprobarTodos = async () => {
    if (!grupoId) {
      alert("No se encontró el ID del grupo.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/api/registrogestion/aprobar-todos-por-grupo/${grupoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Se aprobaron todos los registros pendientes de este grupo.");
      await obtenerRegistros();
    } catch (error) {
      console.error("Error al aprobar todos los registros del grupo:", error);
      alert("No se pudo aprobar todos los registros.");
    }
  };

  const aprobarIndividual = async (usuarioId) => {
    try {
      await axios.post(
        `${API_BASE}/api/registrogestion/aprobar-distrito`,
        { usuarioId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await obtenerRegistros();
    } catch (error) {
      console.error("Error al aprobar el registro:", error);
      alert("No se pudo aprobar este registro.");
    }
  };

  // 🔵 NUEVO: Enviar a nacional (por grupo)
  const enviarANacional = async () => {
    if (!grupoId) {
      alert("No se encontró el ID del grupo.");
      return;
    }
    const pendientesDeEnvio = Math.max(aprobados - enviadosNacional, 0);
    if (pendientesDeEnvio <= 0) {
      alert("No hay registros aprobados pendientes de enviar a nacional.");
      return;
    }
    const continuar = confirm(
      `Se enviarán ${pendientesDeEnvio} registro(s) aprobados a nivel nacional.\n\n¿Confirmas?`
    );
    if (!continuar) return;

    try {
      const res = await axios.post(
        `${API_BASE}/api/registrogestion/enviar-a-nacional/${grupoId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const marcados = res?.data?.enviados ?? 0;
      alert(`📤 Se marcaron ${marcados} registro(s) como "Enviado a nacional".`);
      await obtenerRegistros();
    } catch (error) {
      console.error("Error al enviar a nacional:", error);
      alert("No se pudo enviar a nacional.");
    }
  };

  // 🔵 NUEVO: Enviar a nacional (individual)
  const enviarANacionalIndividual = async (usuarioId, aprobado, yaEnviado) => {
    if (!aprobado) {
      alert("Este registro aún no está aprobado por el distrito.");
      return;
    }
    if (yaEnviado) {
      alert("Este registro ya fue enviado a nacional.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/api/registrogestion/enviar-a-nacional/individual`,
        { usuarioId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await obtenerRegistros();
    } catch (error) {
      console.error("Error al enviar a nacional (individual):", error);
      alert("No se pudo enviar este registro a nacional.");
    }
  };

  return (
    <div className="pt-6 pb-20 px-4">
      <MenuFijoDistrito />
      <h2 className="text-2xl font-bold text-center mb-2">
        GESTION DE REGISTROS
      </h2>
      <h3 className="text-lg font-medium text-center mb-6">
        GRUPO SCOUT: {grupoNombre}
      </h3>

      {cargando ? (
        <p className="text-center">Cargando registros del grupo...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          {/* RESUMEN DEL GRUPO */}
          <div className="border rounded-xl p-4 mb-6 bg-purple-50 shadow-sm max-w-xl mx-auto">
            <p className="font-semibold text-lg">GRUPO SCOUT {grupoNombre}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
              <p>
                Registros totales: <strong>{totalRegistros}</strong>
              </p>
              <p>
                Aprobados distrito:{" "}
                <strong className="text-green-700">{aprobados}</strong>
              </p>
              <p>
                Enviados a nacional:{" "}
                <strong className="text-indigo-700">{enviadosNacional}</strong>
              </p>
              {totalRegistros - aprobados > 0 && (
                <p className="text-red-600">
                  Pendientes de aprobación:{" "}
                  <strong>{totalRegistros - aprobados}</strong>
                </p>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={aprobarTodos}
                className="bg-green-700 text-white px-4 py-2 rounded-xl"
              >
                Aprobar todos los registros pendientes
              </button>

              {/* 🔵 Botón Enviar a nacional (por grupo) */}
              <button
                onClick={enviarANacional}
                className="bg-indigo-700 text-white px-4 py-2 rounded-xl disabled:bg-gray-400"
                title="Marca como 'Enviado a nacional' todos los APROBADOS de este grupo que aún no se enviaron"
                disabled={aprobados - enviadosNacional <= 0}
              >
                Enviar todos los aprobados a nacional
              </button>
            </div>
          </div>

          {/* LISTA DETALLADA */}
          <h4 className="text-md font-semibold mb-2">
            Lista de Registros del Grupo {grupoNombre}
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left bg-white shadow">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-4 py-2">Nombre</th>
                  <th className="border px-4 py-2">CI</th>
                  <th className="border px-4 py-2">Rama</th>
                  <th className="border px-4 py-2">Unidad</th>
                  <th className="border px-4 py-2">Grupo</th>
                  <th className="border px-4 py-2">Estado</th>
                  <th className="border px-4 py-2">Nacional</th>
                  <th className="border px-4 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.usuarioId} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{r.nombreCompleto}</td>
                    <td className="border px-4 py-2">{r.ci}</td>
                    <td className="border px-4 py-2">{r.rama}</td>
                    <td className="border px-4 py-2">{r.unidadNombre}</td>
                    <td className="border px-4 py-2">{r.grupoNombre}</td>
                    <td className="border px-4 py-2">
                      <span
                        className={
                          r.aprobadoDistrito
                            ? "text-green-600 font-semibold"
                            : "text-yellow-600 font-semibold"
                        }
                      >
                        {r.aprobadoDistrito ? "Aprobado" : "Pendiente"}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={
                          r.enviadoANacional
                            ? "text-indigo-700 font-semibold"
                            : "text-gray-600"
                        }
                      >
                        {r.enviadoANacional ? "Enviado" : "No enviado"}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => aprobarIndividual(r.usuarioId)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                          disabled={r.aprobadoDistrito}
                          title="Aprobar registro"
                        >
                          Aprobar
                        </button>

                        {/* 🔵 NUEVO: Enviar individual a nacional */}
                        <button
                          onClick={() =>
                            enviarANacionalIndividual(
                              r.usuarioId,
                              r.aprobadoDistrito,
                              r.enviadoANacional
                            )
                          }
                          className="bg-indigo-700 text-white px-3 py-1 rounded hover:bg-indigo-800 disabled:bg-gray-400"
                          disabled={!r.aprobadoDistrito || r.enviadoANacional}
                          title="Enviar este registro a nacional"
                        >
                          Enviar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!registros.length && (
                  <tr>
                    <td className="border px-4 py-3 text-center text-gray-500" colSpan={8}>
                      No hay registros para este grupo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
