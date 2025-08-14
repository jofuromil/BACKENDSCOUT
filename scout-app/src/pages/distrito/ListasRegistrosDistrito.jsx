import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuFijoDistrito from "@/components/MenuFijoDistrito";

const API_BASE = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

function getDistritoIdFromStorage() {
  return (
    localStorage.getItem("nivelDistritoId") ||
    localStorage.getItem("distritoId") ||
    localStorage.getItem("distritol") ||
    null
  );
}

function cell(v) {
  return v === null || v === undefined || v === "" ? "—" : v;
}

function fechaBonita(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return "—";
  }
}

export default function ListasRegistrosDistrito() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = async (distritoId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/distrito/${distritoId}/listas-registros`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar listas:", err);
      setError("No se pudo cargar las listas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No se encontró el token de autenticación.");
      setCargando(false);
      return;
    }
    const distritoId = getDistritoIdFromStorage();
    if (!distritoId) {
      setError("No se ha seleccionado un distrito.");
      setCargando(false);
      return;
    }
    fetchData(distritoId);
  }, []);

  if (cargando)
    return (
      <>
        <MenuFijoDistrito />
        <div className="pt-16 p-4">Cargando listas…</div>
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
      <div className="pt-16 p-4 space-y-6">
        <h1 className="text-xl font-bold">
          Listas de Registros — Distrito Scout {data?.distritoNombre?.toUpperCase()}
        </h1>

        {/* Por Grupo → Unidades → Scouts */}
        {data?.grupos?.length ? (
          data.grupos.map((g) => (
            <div key={g.grupoScoutId} className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-2">
                Grupo: {g.grupoScoutNombre}
              </h2>

              {g.unidades?.length ? (
                g.unidades.map((u) => (
                  <div key={u.unidadId} className="mb-4">
                    <h3 className="font-medium mb-2">
                      Unidad: {u.unidadNombre} — Rama: {cell(u.rama)}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] w-full border-collapse">
                        <thead className="bg-purple-100">
                          <tr>
                            <th className="px-2 py-2 text-left">Nombre Completo</th>
                            <th className="px-2 py-2 text-left">Carnet de Identidad</th>
                            <th className="px-2 py-2 text-left">Fecha de Nacimiento</th>
                            <th className="px-2 py-2 text-left">Sexo</th>
                            <th className="px-2 py-2 text-left">Colegio</th>
                            <th className="px-2 py-2 text-left">Curso</th>
                          </tr>
                        </thead>
                        <tbody>
                          {u.scouts?.length ? (
                            u.scouts.map((s) => (
                              <tr key={s.userId} className="border-b last:border-0">
                                <td className="px-2 py-1">{cell(s.nombreCompleto)}</td>
                                <td className="px-2 py-1">{cell(s.carnetIdentidad)}</td>
                                <td className="px-2 py-1">{fechaBonita(s.fechaNacimiento)}</td>
                                <td className="px-2 py-1">{cell(s.sexo)}</td>
                                <td className="px-2 py-1">{cell(s.colegio)}</td>
                                <td className="px-2 py-1">{cell(s.curso)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-2 py-3 text-center text-sm text-gray-500" colSpan={6}>
                                Sin scouts registrados/validados en esta unidad.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">Este grupo no tiene unidades con registros validados.</div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow p-4 text-sm text-gray-600">
            No hay grupos con registros validados en este distrito.
          </div>
        )}

        {/* Lista final de Dirigentes */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Dirigentes del Distrito</h2>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-2 py-2 text-left">Grupo</th>
                  <th className="px-2 py-2 text-left">Nombre Completo</th>
                  <th className="px-2 py-2 text-left">Carnet de Identidad</th>
                  <th className="px-2 py-2 text-left">Fecha de Nacimiento</th>
                  <th className="px-2 py-2 text-left">Sexo</th>
                  <th className="px-2 py-2 text-left">Profesión</th>
                  <th className="px-2 py-2 text-left">Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {data?.dirigentes?.length ? (
                  data.dirigentes.map((d) => (
                    <tr key={d.userId} className="border-b last:border-0">
                      <td className="px-2 py-1">{cell(d.grupoScoutNombre)}</td>
                      <td className="px-2 py-1">{cell(d.nombreCompleto)}</td>
                      <td className="px-2 py-1">{cell(d.carnetIdentidad)}</td>
                      <td className="px-2 py-1">{fechaBonita(d.fechaNacimiento)}</td>
                      <td className="px-2 py-1">{cell(d.sexo)}</td>
                      <td className="px-2 py-1">{cell(d.profesion)}</td>
                      <td className="px-2 py-1">{cell(d.ocupacion)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-2 py-3 text-center text-sm text-gray-500" colSpan={7}>
                      No hay dirigentes validados en el distrito.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
