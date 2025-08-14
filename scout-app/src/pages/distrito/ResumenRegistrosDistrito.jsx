import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";

// claves reales que devuelve el backend (camelCase/minúsculas)
const RAMAS = ["lob", "exp", "pio", "rov", "dir"];
const SEXOS = ["m", "f", "t"];
const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

// Obtiene el distritoId de forma robusta (acepta variantes que vi en tu LocalStorage)
function getDistritoIdFromStorage() {
  // prioridad: nivelDistritoId (nuevo) > distritoId (común) > distritol (tipo) 
  return (
    localStorage.getItem("nivelDistritoId") ||
    localStorage.getItem("distritoId") ||
    localStorage.getItem("distritol") ||
    null
  );
}

export default function ResumenRegistrosDistrito() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async (distritoId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/distrito/${distritoId}/resumen-registros`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar resumen:", err);
      setError("No se pudo cargar el resumen.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // Validaciones previas
    if (!token) {
      setError("No se encontró el token de autenticación.");
      setCargando(false);
      return;
    }

    const distritoId = getDistritoIdFromStorage();
    // Log temporal para confirmar qué llave está leyendo
    console.log("distritoId (leído de storage):", distritoId);

    if (!distritoId) {
      setError("No se ha seleccionado un distrito.");
      setCargando(false);
      return;
    }

    fetchData(distritoId);
  }, []); // solo al montar

  const C = ({ v }) => (
    <span className="tabular-nums">{typeof v === "number" ? v : v ?? 0}</span>
  );

  const CabezalRamas = () => (
    <thead className="bg-purple-300">
      <tr>
        <th rowSpan={2} className="px-2 py-2 text-left">
          #
        </th>
        <th rowSpan={2} className="px-2 py-2 text-left">
          Grupo Scout
        </th>
        <th rowSpan={2} className="px-2 py-2 text-center">
          N° Unid.
        </th>
        {RAMAS.map((r) => (
          <th key={r} colSpan={3} className="px-2 py-2 text-center">
            {r.toUpperCase()}
          </th>
        ))}
        <th colSpan={3} className="px-2 py-2 text-center">
          TOTAL
        </th>
      </tr>
      <tr>
        {RAMAS.flatMap(() =>
          SEXOS.map((h, idx) => (
            <th key={`h-${idx}`} className="px-2 py-1 text-center text-xs">
              {h.toUpperCase()}
            </th>
          ))
        )}
        <th className="px-2 py-1 text-center text-xs">M</th>
        <th className="px-2 py-1 text-center text-xs">F</th>
        <th className="px-2 py-1 text-center text-xs">T</th>
      </tr>
    </thead>
  );

  const FilaTotales = ({ titulo, conteo, destacado = false }) => (
    <tr className={destacado ? "bg-purple-300 font-semibold" : "bg-white"}>
      <td className="px-2 py-1" colSpan={3}>
        {titulo}
      </td>
      {RAMAS.flatMap((r) =>
        SEXOS.map((s) => (
          <td key={`${r}-${s}`} className="px-2 py-1 text-center">
            <C v={conteo?.[r]?.[s]} />
          </td>
        ))
      )}
      <td className="px-2 py-1 text-center">
        <C v={conteo?.totalM} />
      </td>
      <td className="px-2 py-1 text-center">
        <C v={conteo?.totalF} />
      </td>
      <td className="px-2 py-1 text-center">
        <C v={conteo?.total} />
      </td>
    </tr>
  );

  if (cargando)
    return (
      <>
        <MenuFijoDistrito />
        <div className="pt-16 p-4">Cargando resumen...</div>
      </>
    );

  if (error)
    return (
      <>
        <MenuFijoDistrito />
        <div className="pt-16 p-4 text-red-600">{error}</div>
      </>
    );

  return (
    <>
      <MenuFijoDistrito />
      <div className="pt-16 p-4">
        <h1 className="text-xl font-bold mb-3">
          DISTRITO SCOUT {data?.distritoNombre?.toUpperCase()} — Resumen de
          registros validados
        </h1>

        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="min-w-[1000px] w-full border-collapse">
            <CabezalRamas />
            <tbody>
              {data?.grupos?.length ? (
                data.grupos.map((g, idx) => (
                  <React.Fragment key={g.grupoScoutId}>
                    {/* Fila principal del grupo */}
                    <tr className="bg-purple-200/60 font-semibold">
                      <td className="px-2 py-1 text-center">{idx + 1}</td>
                      <td className="px-2 py-1">{g.grupoScoutNombre}</td>
                      <td className="px-2 py-1 text-center">
                        {g.numeroUnidades}
                      </td>

                      {RAMAS.flatMap((r) =>
                        SEXOS.map((s) => (
                          <td
                            key={`${g.grupoScoutId}-${r}-${s}`}
                            className="px-2 py-1 text-center"
                          >
                            <C v={g.totalesGrupo?.[r]?.[s]} />
                          </td>
                        ))
                      )}

                      <td className="px-2 py-1 text-center">
                        <C v={g.totalesGrupo?.totalM} />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <C v={g.totalesGrupo?.totalF} />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <C v={g.totalesGrupo?.total} />
                      </td>
                    </tr>

                    {/* Filas por unidad */}
                    {g.unidades?.map((u, i) => (
                      <tr key={u.unidadId} className="bg-white">
                        <td className="px-2 py-1 text-right text-xs text-gray-500">
                          {/* vacío */}
                        </td>
                        <td className="px-2 py-1 pl-6 text-sm">{`${
                          i + 1
                        }ª Unidad — ${u.unidadNombre}`}</td>
                        <td className="px-2 py-1 text-center">—</td>

                        {RAMAS.flatMap((r) =>
                          SEXOS.map((s) => (
                            <td
                              key={`${u.unidadId}-${r}-${s}`}
                              className="px-2 py-1 text-center"
                            >
                              <C v={u.conteo?.[r]?.[s]} />
                            </td>
                          ))
                        )}

                        <td className="px-2 py-1 text-center">
                          <C v={u.conteo?.totalM} />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <C v={u.conteo?.totalF} />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <C v={u.conteo?.total} />
                        </td>
                      </tr>
                    ))}

                    {/* Subtotal por grupo (decorativo) */}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3 + RAMAS.length * 3 + 3}
                        className="px-2 py-1 text-right text-xs text-gray-50"
                      >
                        Subtotal grupo {g.grupoScoutNombre}
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td className="px-2 py-4 text-center" colSpan={3 + RAMAS.length * 3 + 3}>
                    No hay datos para mostrar.
                  </td>
                </tr>
              )}

              {/* Totales de distrito */}
              <FilaTotales
                titulo="TOTALES DISTRITO"
                conteo={data?.totalesDistrito}
                destacado
              />
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
