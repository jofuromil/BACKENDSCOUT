import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { exportarPDF } from "@/utils/exportarPDF";
import MenuFijoGrupo from "../../components/MenuFijoGrupo";

export default function VerUnidadesGrupo() {
  const grupoId = localStorage.getItem("grupoId");
  const [unidades, setUnidades] = useState([]);
  const [resumenAprobados, setResumenAprobados] = useState([]);
  const [grupo, setGrupo] = useState(null);
  const [error, setError] = useState("");
  const resumenRef = useRef();
  const resumenAprobadosRef = useRef();
  const [resumenRegistros, setResumenRegistros] = useState([]);
  const resumenRegistroRef = useRef();
  const [resumenEnviados, setResumenEnviados] = useState([]);
  const resumenEnviadosRef = useRef();

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
    const fetchResumenRegistros = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/gruposcout/${grupoId}/resumen-registros`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResumenRegistros(res.data);
      } catch (error) {
        console.error("Error al obtener resumen de registros aprobados:", error);
      }
    };
    
    const fetchResumenEnviados = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/gruposcout/${grupoId}/resumen-enviados`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResumenEnviados(res.data);
      } catch (error) {
        console.error("Error al obtener resumen de registros aprobados:", error);
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
    fetchResumenRegistros();
    fetchResumenEnviados();
  }, [grupoId]);

  const totalizar = (campo, lista = unidades) =>
  lista.reduce((acc, u) => acc + (u[campo] || 0), 0);

  const normalizar = (texto) =>
    texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");

const exportarBloquePDF = (bloqueId, nombreArchivo) => {
  const container = document.getElementById(bloqueId);

  if (!container) {
    console.error("No se encontró el contenedor con id:", bloqueId);
    return;
  }

  // 🎨 Corrección de colores
  const tables = container.querySelectorAll("table");
  tables.forEach((table) => {
    table.style.backgroundColor = "#6b21a8";
    table.style.color = "#ffffff";

    table.querySelectorAll("th").forEach((th) => {
      th.style.backgroundColor = "#6b21a8";
      th.style.color = "#ffffff";
    });

    table.querySelectorAll("td").forEach((td) => {
      td.style.color = "#000000";
    });
  });

  // 🧩 Importación dinámica y USO CORRECTO de html2pdf
  import("html2pdf.js").then((module) => {
    const html2pdf = module.default;

    const opt = {
      margin: 0.5,
      filename: nombreArchivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    setTimeout(() => {
      html2pdf().set(opt).from(container).save();
    }, 100);
  });
};


  return (
    <div className="pt-24 px-4 pb-10">
      <MenuFijoGrupo />

      {/* ✅ Contenedor con ID para exportación PDF */}
<div id="bloque-unidades" ref={resumenRef}>
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
          <thead className="bg-purple-700 text-white print:pdf-header">
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
            <tr className="bg-purple-700 text-white font-semibold print:pdf-total">
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
            onClick={() => exportarPDF("bloque-unidades", "UnidadesGrupo.pdf")}
            className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
          >
            Descargar PDF
          </button>
        </div>
      )}
      
{/* ✅ TABLA 2: Registros aprobados por unidad */}
{resumenRegistros.length > 0 && (
  <div className="mt-16">
    <div id="bloque-aprobados" ref={resumenRegistroRef}>
      <h2 className="text-xl font-semibold text-center mb-6">
        Resumen de Registros Aprobados por Unidad
      </h2>

      <div className="overflow-auto">
        <table className="min-w-full border border-purple-700 text-sm text-center">
          <thead className="bg-purple-700 text-white print:pdf-header">
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
            {resumenRegistros.map((u, i) => (
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
            <tr className="bg-purple-700 text-white font-semibold print:pdf-total">
              <td className="border px-2 py-1 text-right" colSpan="2">TOTALES</td>
              <td className="border px-2 py-1">{totalizar("cantScoutsHombres", resumenRegistros)}</td>
              <td className="border px-2 py-1">{totalizar("cantScoutsMujeres", resumenRegistros)}</td>
              <td className="border px-2 py-1">{totalizar("cantScouts", resumenRegistros)}</td>
              <td className="border px-2 py-1">{totalizar("cantDirigentesHombres", resumenRegistros)}</td>
              <td className="border px-2 py-1">{totalizar("cantDirigentesMujeres", resumenRegistros)}</td>
              <td className="border px-2 py-1">{totalizar("cantDirigentes", resumenRegistros)}</td>
              <td className="border px-2 py-1">
                {totalizar("cantScoutsHombres", resumenRegistros) + totalizar("cantDirigentesHombres", resumenRegistros)}
              </td>
              <td className="border px-2 py-1">
                {totalizar("cantScoutsMujeres", resumenRegistros) + totalizar("cantDirigentesMujeres", resumenRegistros)}
              </td>
              <td className="border px-2 py-1">{totalizar("total", resumenRegistros)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="flex justify-end mt-4">
      <button
        onClick={() => exportarPDF("bloque-aprobados", "RegistrosAprobados.pdf")}
        className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
      >
        Descargar PDF
      </button>
    </div>
  </div>
)}

{/* ✅ TABLA 3: Registros enviados al distrito */}
{resumenEnviados.length > 0 && (
  <div className="mt-16">
    <div id="bloque-enviados" ref={resumenEnviadosRef}>
      <h2 className="text-xl font-semibold text-center mb-6">
        Resumen de Registros Enviados al Distrito
      </h2>

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
            {resumenEnviados.map((u, i) => (
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
            <tr className="bg-purple-700 text-white font-semibold print:pdf-total">
              <td className="border px-2 py-1 text-right" colSpan="2">TOTALES</td>
              <td className="border px-2 py-1">{totalizar("cantScoutsHombres", resumenEnviados)}</td>
              <td className="border px-2 py-1">{totalizar("cantScoutsMujeres", resumenEnviados)}</td>
              <td className="border px-2 py-1">{totalizar("cantScouts", resumenEnviados)}</td>
              <td className="border px-2 py-1">{totalizar("cantDirigentesHombres", resumenEnviados)}</td>
              <td className="border px-2 py-1">{totalizar("cantDirigentesMujeres", resumenEnviados)}</td>
              <td className="border px-2 py-1">{totalizar("cantDirigentes", resumenEnviados)}</td>
              <td className="border px-2 py-1">
                {totalizar("cantScoutsHombres", resumenEnviados) + totalizar("cantDirigentesHombres", resumenEnviados)}
              </td>
              <td className="border px-2 py-1">
                {totalizar("cantScoutsMujeres", resumenEnviados) + totalizar("cantDirigentesMujeres", resumenEnviados)}
              </td>
              <td className="border px-2 py-1">{totalizar("total", resumenEnviados)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="flex justify-end mt-4">
      <button
        onClick={() => exportarPDF("bloque-enviados", "RegistrosEnviados.pdf")}
        className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
      >
        Descargar PDF
      </button>
    </div>
  </div>
)}
    </div>
    
  );
}
