import { useEffect, useState } from "react";
import axios from "axios";
import MenuFijo from "@/components/MenuFijo";
// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

function Objetivos() {
  const token = localStorage.getItem("token");
  const usuarioId = localStorage.getItem("usuarioId");
  const rama = localStorage.getItem("rama");
  const nivelProgresion = localStorage.getItem("nivelProgresion") || "";
  const areaSeleccionada = localStorage.getItem("areaObjetivo") || "";

  const [objetivos, setObjetivos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!token || !usuarioId || !rama) {
      window.location.href = "/login";
      return;
    }

    axios
      .get(`http://localhost:8080/api/Objetivo/historial?usuarioId=${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ids = res.data.map((o) => o.id);
        setSeleccionados(ids);
      })
      .catch(() => setMensaje("❌ Error al cargar historial de objetivos."));
  }, [usuarioId, token]);

  useEffect(() => {
    if (!token || !rama) return;

    let url = `http://localhost:8080/api/Objetivo/listar?rama=${encodeURIComponent(rama)}`;
    if (nivelProgresion) {
      url += `&nivelProgresion=${encodeURIComponent(nivelProgresion)}`;
    }
    if (areaSeleccionada && areaSeleccionada !== "TODAS LAS AREAS") {
      url += `&area=${encodeURIComponent(areaSeleccionada)}`;
    }

    axios
      .get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const ordenado = [...res.data].sort((a, b) => a.area.localeCompare(b.area));
        setObjetivos(ordenado);
      })
      .catch(() => setMensaje("❌ Error al cargar los objetivos."));
  }, [rama, nivelProgresion, areaSeleccionada, token]);

  const seleccionar = (id) => {
    axios
      .post(
        "http://localhost:8080/api/Objetivo/seleccionar",
        { objetivoEducativoId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setSeleccionados((prev) => [...prev, id]);
        setMensaje("✅ Objetivo seleccionado correctamente.");
      })
      .catch(() => setMensaje("❌ Hubo un problema al seleccionar el objetivo."));
  };

  const colores = {
    afectividad: "#FAD4D4",
    carácter: "#F6B36B",
    corporalidad: "#FFF5B1",
    creatividad: "#E1D3F9",
    espiritualidad: "#D7F5D0",
    sociabilidad: "#D8EEFA",
  };

  const objetivosAgrupados = objetivos.reduce((grupos, obj) => {
    const area = obj.area?.toLowerCase() || "sin área";
    if (!grupos[area]) grupos[area] = [];
    grupos[area].push(obj);
    return grupos;
  }, {});

  return (
    <div
          className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
          style={{
            backgroundImage: `url(${fondoScout})`,
            backgroundRepeat: "repeat",
            backgroundSize: "contain"
          }}
        >
    <div className="min-h-screen pb-20">
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-4xl mx-auto pt-6 px-4">
        <h1 className="text-2xl font-bold mb-4 text-center">🎯 Seleccionar Objetivos Educativos</h1>
        {mensaje && <p className="mb-4 text-sm text-center">{mensaje}</p>}

        {Object.keys(objetivosAgrupados).length === 0 ? (
          <p>No hay objetivos disponibles para esta selección.</p>
        ) : (
          Object.entries(objetivosAgrupados)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([area, lista]) => (
              <div
                key={area}
                className="mb-8 p-4 rounded"
                style={{ backgroundColor: colores[area] || "#F3F4F6" }}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={`/img/areas/${rama.toLowerCase()}/${area}.png`}
                    alt={area}
                    className="w-10 h-10 mr-3"
                  />
                  <h2 className="text-xl font-semibold capitalize">{area}</h2>
                </div>
                {lista.map((obj) => (
                  <div
                    key={obj.id}
                    className={`bg-white p-4 mb-4 rounded shadow transition ${
                      seleccionados.includes(obj.id) ? "bg-green-100" : ""
                    }`}
                  >
                    <h3 className="text-lg font-semibold">{obj.nombre}</h3>
                    {obj.nivelProgresion && (
                      <p className="text-sm italic mb-1">Nivel: {obj.nivelProgresion}</p>
                    )}
                    <p className="mb-2">{obj.descripcion}</p>
                    <button
                      onClick={() => seleccionar(obj.id)}
                      disabled={seleccionados.includes(obj.id)}
                      className={`py-2 px-4 rounded ${
                        seleccionados.includes(obj.id)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {seleccionados.includes(obj.id) ? "Seleccionado" : "Seleccionar"}
                    </button>
                  </div>
                ))}
              </div>
            ))
        )}
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
    </div>
  );
}

export default Objetivos;
