import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import MenuFijoGrupo from "../../components/MenuFijoGrupo";

export default function VerUnidadesGrupo() {
  const grupoId = localStorage.getItem("grupoId");
  const [unidades, setUnidades] = useState([]);
  const [grupo, setGrupo] = useState(null);
  const [error, setError] = useState("");
  const resumenRef = useRef(); // ✅ NUEVO: contenedor para exportar

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!grupoId) {
      console.error("Grupo ID no encontrado en localStorage.");
      setError("No se encontró información del grupo.");
      return;
    }

    const fetchGrupo = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/gruposcout/${grupoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGrupo(res.data);
      } catch (error) {
        console.error("Error al obtener el grupo:", error);
        setError("No se pudo obtener los datos del grupo.");
      }
    };

    const fetchResumen = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/gruposcout/${grupoId}/resumen-unidades`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnidades(res.data);
      } catch (error) {
        setError("No se pudo cargar el resumen de unidades.");
        console.error(error);
      }
    };

    fetchGrupo();
    fetchResumen();
  }, [grupoId]);

  const totalizar = (campo) => unidades.reduce((acc, u) => acc + u[campo], 0);

  const normalizar = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

  const exportarPDF = () => {
    const element = resumenRef.current;
    import("html2pdf.js").then((html2pdf) => {
      html2pdf.default()
        .from(element)
        .set({
          margin: 0.5,
          filename: `ResumenUnidades_${grupo?.nombre || "GrupoScout"}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save();
    });
  };

  return (
    <div className="pt-24 px-4 pb-10">
      <MenuFijoGrupo />

      <div ref={resumenRef}> {/* ✅ TODO lo exportable va dentro */}
        {grupo && (
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            {grupo.distrito && grupo.nombre && (
              <img
                src={`/img/grupos/${normalizar(grupo.distrito)}/${normalizar(grupo.nombre)}.png`}
                alt="Logo grupo"
                className="w-20 h-20 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold text-center">
              Grupo Scout {grupo.nombre}
            </h1>
          </div>
        )}

        <h2 className="text-xl font-semibold text-center mb-6">
          Resumen de Unidades del Grupo
        </h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        {unidades.length > 0 && (
          <>
            <div className="overflow-auto">
              <table className="min-w-full border border-purple-700 text-sm text-center">
                <thead className="bg-purple-700 text-white">
                  <tr>
                    <th rowSpan="2" className="border px-2 py-1">UNIDAD</th>
                    <th rowSpan="2" className="border px-2 py-1">RAMA</th>
                    <th colSpan="3" className="border px-2 py-1">SCOUTS</th>
                    <th colSpan="3" className="border px-2 py-1">DIRIGENTES</th>
                    <th colSpan="3" className="border px-2 py-1">TOTALES</th>
                  </tr>
                  <tr>
                    <th className="border px-2 py-1">M</th>
                    <th className="border px-2 py-1">F</th>
                    <th className="border px-2 py-1">T</th>
                    <th className="border px-2 py-1">M</th>
                    <th className="border px-2 py-1">F</th>
                    <th className="border px-2 py-1">T</th>
                    <th className="border px-2 py-1">M</th>
                    <th className="border px-2 py-1">F</th>
                    <th className="border px-2 py-1">T</th>
                  </tr>
                </thead>
                <tbody>
                  {unidades.map((u, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-purple-50" : "bg-white"}>
                      <td className="border px-2 py-1">{u.nombre}</td>
                      <td className="border px-2 py-1">{u.rama}</td>
                      <td className="border px-2 py-1">{u.cantScoutsHombres}</td>
                      <td className="border px-2 py-1">{u.cantScoutsMujeres}</td>
                      <td className="border px-2 py-1">{u.cantScouts}</td>
                      <td className="border px-2 py-1">{u.cantDirigentesHombres}</td>
                      <td className="border px-2 py-1">{u.cantDirigentesMujeres}</td>
                      <td className="border px-2 py-1">{u.cantDirigentes}</td>
                      <td className="border px-2 py-1">{u.cantScoutsHombres + u.cantDirigentesHombres}</td>
                      <td className="border px-2 py-1">{u.cantScoutsMujeres + u.cantDirigentesMujeres}</td>
                      <td className="border px-2 py-1">{u.total}</td>
                    </tr>
                  ))}
                  <tr className="bg-purple-700 text-white font-semibold">
                    <td className="border px-2 py-1 text-right" colSpan="2">TOTALES</td>
                    <td className="border px-2 py-1">{totalizar("cantScoutsHombres")}</td>
                    <td className="border px-2 py-1">{totalizar("cantScoutsMujeres")}</td>
                    <td className="border px-2 py-1">{totalizar("cantScouts")}</td>
                    <td className="border px-2 py-1">{totalizar("cantDirigentesHombres")}</td>
                    <td className="border px-2 py-1">{totalizar("cantDirigentesMujeres")}</td>
                    <td className="border px-2 py-1">{totalizar("cantDirigentes")}</td>
                    <td className="border px-2 py-1">
                      {totalizar("cantScoutsHombres") + totalizar("cantDirigentesHombres")}
                    </td>
                    <td className="border px-2 py-1">
                      {totalizar("cantScoutsMujeres") + totalizar("cantDirigentesMujeres")}
                    </td>
                    <td className="border px-2 py-1">{totalizar("total")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-sm text-center text-orange-600 italic">
              ⚠️ Para que el cuadro muestre los datos correctos, es necesario que todos los perfiles de usuario estén completos.
            </div>
          </>
        )}
      </div>

      {/* ✅ Botón fuera del contenido exportable */}
      {unidades.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={exportarPDF}
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 text-sm"
          >
            Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}
