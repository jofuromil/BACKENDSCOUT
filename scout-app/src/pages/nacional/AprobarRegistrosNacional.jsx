// src/pages/nacional/AprobarRegistrosNacional.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MenuFijoNacional from "@/components/MenuFijoNacional";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";
const BTN = "inline-flex items-center gap-2 bg-green-50 text-green-900 border-2 border-green-800 rounded-xl px-3 py-2 shadow-sm hover:bg-green-100 hover:shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-300";

export default function AprobarRegistrosNacional() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [soyAdmin, setSoyAdmin] = useState(false);
  const [resumen, setResumen] = useState([]);

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

      const r = await axios.get(`${API_BASE}/api/nacional/pendientes/resumen-por-distrito`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumen(r.data || []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el resumen por distrito.");
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
  }, []);

  return (
    <>
      <MenuFijoNacional />
      <div className="pt-20 pb-24 px-4 space-y-4">
        <h1 className="text-2xl font-bold text-green-800">Aprobar registros — Resumen por distrito</h1>

        {cargando ? (
          <div>Cargando…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !soyAdmin ? (
          <div>No autorizado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resumen.map((d) => {
              const hayPend = (d.pendientes ?? 0) > 0;
              return (
                <div key={d.distritoId ?? d.distritoNombre} className="rounded-2xl bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-semibold text-green-900">{d.distritoNombre ?? "—"}</h2>
                    {hayPend ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                        Pendientes: {d.pendientes}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-300">
                        Sin pendientes
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                      <div className="text-gray-600">Enviados</div>
                      <div className="text-lg font-bold">{d.enviados ?? 0}</div>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                      <div className="text-gray-600">Aprobados</div>
                      <div className="text-lg font-bold">{d.aprobados ?? 0}</div>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                      <div className="text-gray-600">Pendientes</div>
                      <div className="text-lg font-bold">{d.pendientes ?? 0}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      className={BTN}
                      onClick={() => navigate(`/nacional/aprobar-registros/distrito/${d.distritoId}`)}
                      disabled={d.distritoId == null}
                      title="Ver y aprobar registros de este distrito"
                    >
                      Aprobar registros
                    </button>
                  </div>
                </div>
              );
            })}
            {!resumen.length && (
              <div className="col-span-full text-sm text-gray-500">No hay datos.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
