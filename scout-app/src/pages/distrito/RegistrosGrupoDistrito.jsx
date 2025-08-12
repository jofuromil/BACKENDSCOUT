import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";

export default function RegistrosGrupoDistrito() {
  const { grupoId } = useParams();
  const token = localStorage.getItem("token");

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [grupoNombre, setGrupoNombre] = useState("");
  const [enviados, setEnviados] = useState(0);
  const [aprobados, setAprobados] = useState(0);

  const obtenerRegistros = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/registrogestion/registros-por-grupo/${grupoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRegistros(res.data);
      if (res.data.length > 0) {
        const grupo = res.data[0].grupoNombre || "";
        const total = res.data.length;
        const aprobadosCount = res.data.filter(r => r.aprobadoDistrito).length;
        setGrupoNombre(grupo);
        setEnviados(total);
        setAprobados(aprobadosCount);
      }
    } catch (err) {
      console.error("Error al obtener registros del grupo:", err);
      setError("No se pudieron cargar los registros.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const aprobarTodos = async () => {
    if (!grupoId) {
      alert("No se encontró el ID del grupo.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/registrogestion/aprobar-todos-por-grupo/${grupoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
        "http://localhost:8080/api/registrogestion/aprobar-distrito",
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

  return (
    <div className="pt-6 pb-20 px-4">
      <MenuFijoDistrito />
      <h2 className="text-2xl font-bold text-center mb-2">
        REGISTROS PENDIENTES DE APROBACIÓN
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
            <p className="font-semibold text-lg">{grupoNombre}</p>
            <p>
              Registros enviados: <strong>{enviados}</strong>
            </p>
            <p>
              Registros aprobados: <strong>{aprobados}</strong>
            </p>
            {enviados - aprobados > 0 && (
              <p className="text-red-600 mt-1">
                Existen registros por aprobar
              </p>
            )}
            <div className="mt-3">
              <button
                onClick={aprobarTodos}
                className="bg-green-700 text-white px-4 py-2 rounded-xl"
              >
                Aprobar todos los registros pendientes
              </button>
            </div>
          </div>

          {/* LISTA DETALLADA */}
          <h4 className="text-md font-semibold mb-2">
            Lista de Registros del Grupo
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
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => aprobarIndividual(r.usuarioId)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        disabled={r.aprobadoDistrito}
                      >
                        Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

