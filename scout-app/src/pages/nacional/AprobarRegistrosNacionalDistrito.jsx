import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MenuFijoNacional from "@/components/MenuFijoNacional";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";
const BTN = "inline-flex items-center gap-2 bg-green-50 text-green-900 border-2 border-green-800 rounded-xl px-3 py-2 shadow-sm hover:bg-green-100 hover:shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-300";

export default function AprobarRegistrosNacionalDistrito() {
  const token = localStorage.getItem("token");
  const { distritoId } = useParams();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [soyAdmin, setSoyAdmin] = useState(false);
  const [pendientes, setPendientes] = useState([]);

  const fetchData = async () => {
    try {
      const soy = await axios.get(`${API_BASE}/api/nacional/soy-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!soy.data?.esAdminNacional) {
        setSoyAdmin(false);
        setError("No tienes permisos de AdminNacional.");
        return;
      }
      setSoyAdmin(true);

      const p = await axios.get(`${API_BASE}/api/nacional/pendientes/distrito/${distritoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendientes(p.data || []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar los pendientes del distrito.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No se encontró el token.");
      setCargando(false);
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distritoId]);

  const aprobar = async (usuarioId) => {
    try {
      await axios.post(`${API_BASE}/api/nacional/aprobar`, { usuarioId }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("No se pudo aprobar en nacional.");
    }
  };

  const aprobarTodos = async () => {
    if (!confirm("¿Aprobar TODOS los pendientes de este distrito?")) return;
    try {
      await axios.post(`${API_BASE}/api/nacional/aprobar-todos/distrito/${distritoId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (e) {
      console.error(e);
      alert("No se pudo aprobar todos.");
    }
  };

  // Agrupar por grupo (opcional, solo visual)
  const porGrupo = useMemo(() => {
    const m = new Map();
    for (const x of pendientes) {
      const key = x.grupo || "—";
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(x);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [pendientes]);

  return (
    <>
      <MenuFijoNacional />
      <div className="pt-20 pb-24 px-4 space-y-4">
        <h1 className="text-2xl font-bold text-green-800">
          Aprobar registros — Distrito {pendientes[0]?.distrito || ""}
        </h1>

        {cargando ? (
          <div>Cargando…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !soyAdmin ? (
          <div>No autorizado.</div>
        ) : (
          <>
            <div className="rounded-2xl bg-white shadow p-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Pendientes del distrito</div>
                <div className="text-2xl font-bold">{pendientes.length}</div>
              </div>
              <button onClick={aprobarTodos} className={BTN} disabled={!pendientes.length}>
                Aprobar todos
              </button>
            </div>

            {porGrupo.map(([grupo, lista]) => (
              <div key={grupo} className="rounded-2xl bg-white shadow p-4">
                <h2 className="font-semibold mb-2">Grupo: {grupo}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-2 border text-left">Nombre</th>
                        <th className="px-2 py-2 border text-left">CI</th>
                        <th className="px-2 py-2 border text-left">Rama</th>
                        <th className="px-2 py-2 border text-left">Unidad</th>
                        <th className="px-2 py-2 border text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((x) => (
                        <tr key={x.usuarioId} className="border-b last:border-0">
                          <td className="px-2 py-1 border">{x.nombreCompleto}</td>
                          <td className="px-2 py-1 border">{x.ci ?? "—"}</td>
                          <td className="px-2 py-1 border">{x.rama}</td>
                          <td className="px-2 py-1 border">{x.unidad}</td>
                          <td className="px-2 py-1 border text-center">
                            <button onClick={() => aprobar(x.usuarioId)} className={BTN}>
                              Aprobar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!lista.length && (
                        <tr>
                          <td className="px-2 py-2 text-center" colSpan={5}>
                            Sin pendientes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {!pendientes.length && (
              <div className="text-sm text-gray-500">No hay registros pendientes en este distrito.</div>
            )}
          </>
        )}
      </div>
    </>
  );
}
