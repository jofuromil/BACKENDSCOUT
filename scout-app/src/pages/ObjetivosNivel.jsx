import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuFijo from "@/components/MenuFijo";

function ObjetivosNivel() {
  const navigate = useNavigate();
  const rama = localStorage.getItem("rama");
  const [nivel, setNivel] = useState("");
  const [area, setArea] = useState("");
  const [opcionesNivel, setOpcionesNivel] = useState([]);

  const opcionesArea = [
    "", // para 'Todas las áreas'
    "AFECTIVIDAD",
    "CARÁCTER",
    "CORPORALIDAD",
    "CREATIVIDAD",
    "ESPIRITUALIDAD",
    "SOCIABILIDAD",
  ];

  useEffect(() => {
    if (rama === "Lobatos") {
      setOpcionesNivel(["", "PATA TIERNA - SALTADOR", "RASTREADOR - CAZADOR"]);
    } else if (rama === "Exploradores") {
      setOpcionesNivel(["", "PISTA - SENDA", "RUMBO - TRAVESIA"]);
    } else {
      // Pioneros y Rovers no tienen nivel pero sí pueden elegir área
      navigate("/objetivos");
    }
  }, [rama, navigate]);

  const continuar = () => {
    localStorage.setItem("nivelProgresion", nivel);
    localStorage.setItem("areaObjetivo", area);
    navigate("/objetivos");
  };

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col items-center justify-center p-6 text-center">
      {/* Menú fijo superior */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <h1 className="text-2xl font-bold mb-6">📘 Elegir Nivel y Área</h1>

      <label className="text-left w-72 mb-1 font-semibold">Nivel de Progresión</label>
      <select
        value={nivel}
        onChange={(e) => setNivel(e.target.value)}
        className="p-3 text-lg w-72 mb-4 border rounded"
      >
        {opcionesNivel.map((op, i) => (
          <option key={i} value={op}>
            {op === "" ? "Todos los niveles" : op}
          </option>
        ))}
      </select>

      <label className="text-left w-72 mb-1 font-semibold">Área de Crecimiento</label>
      <select
        value={area}
        onChange={(e) => setArea(e.target.value)}
        className="p-3 text-lg w-72 mb-6 border rounded"
      >
        {opcionesArea.map((op, i) => (
          <option key={i} value={op}>
            {op === "" ? "Todas las áreas" : op.charAt(0).toUpperCase() + op.slice(1)}
          </option>
        ))}
      </select>

      <button
        onClick={continuar}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Continuar
      </button>

      {/* Menú fijo inferior */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
  );
}

export default ObjetivosNivel;
