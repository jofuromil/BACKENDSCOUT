import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuFijo from "../components/MenuFijo";

// Imágenes visuales para botones
import iconObjetivos from "@/assets/icon-objetivos.png";
import iconEventos from "@/assets/icon-eventos.png";
import iconMensajes from "@/assets/icon-mensajes.png";
import iconEspecialidades from "@/assets/icon-especialidades.png";

// Fondo decorativo
import fondoScout from "@/assets/fondo-scout-suave.png";

function PanelScout() {
  const [nombreScout, setNombreScout] = useState("");
  const [rama, setRama] = useState("");
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [codigoUnidad, setCodigoUnidad] = useState("");
  const [unidadInfoVisible, setUnidadInfoVisible] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const user = res.data;
      setNombreScout(user.nombreCompleto);
      setRama(user.rama || "");
      if (user.unidad) {
        setNombreUnidad(user.unidad.nombre);
        setCodigoUnidad(user.unidad.codigoUnidad);
        setUnidadInfoVisible(true);
      }
    })
    .catch(() => {
      alert("Error al cargar tus datos.");
      navigate("/login");
    });
  }, [navigate]);

  const botones = [
    {
      titulo: "Objetivos educativos",
      imagen: iconObjetivos,
      ruta: "/objetivos-nivel",
      color: "bg-green-100"
    },
    {
      titulo: "Eventos",
      imagen: iconEventos,
      ruta: "/scout/eventos",
      color: "bg-orange-100"
    },
    {
      titulo: "Mensajes",
      imagen: iconMensajes,
      ruta: "/mensajes-recibidos",
      color: "bg-blue-100"
    },
    {
      titulo: "Especialidades",
      imagen: iconEspecialidades,
      ruta: "/registrar-avance-especialidades",
      color: "bg-yellow-100"
    }
  ];

  return (
    <div
      className="min-h-screen bg-white text-gray-800 flex flex-col pb-24 pt-20"
      style={{
        backgroundImage: `url(${fondoScout})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain"
      }}
    >
      {/* Menú fijo superior en escritorio */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
      <div className="max-w-2xl mx-auto mt-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Panel del Scout</h1>

        {/* Datos del scout */}
        <div className="bg-purple-100 p-4 rounded-xl mb-6 shadow">
          <p><strong>Scout:</strong> {nombreScout}</p>
          <p><strong>Rama:</strong> {rama}</p>
          {unidadInfoVisible && (
            <>
              <p><strong>Unidad:</strong> {nombreUnidad}</p>
              <p><strong>Código de unidad:</strong> {codigoUnidad}</p>
            </>
          )}
        </div>

        {/* Botones visuales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {botones.map((btn, index) => (
            <div
              key={index}
              onClick={() => navigate(btn.ruta)}
              className={`cursor-pointer ${btn.color} rounded-2xl p-5 shadow-md hover:scale-105 transition-transform`}
            >
              <img src={btn.imagen} alt={btn.titulo} className="h-20 mx-auto mb-4" />
              <p className="text-center text-lg font-semibold">{btn.titulo}</p>
            </div>
          ))}
        </div>

        {/* Botones pequeños: Perfil y Cerrar sesión */}
        <div className="flex justify-between gap-4">
          <button
            onClick={() => navigate("/perfil")}
            className="border border-gray-500 text-gray-700 px-4 py-2 rounded-full flex-1"
          >
            Ver Perfil
          </button>
          <button
            onClick={() => navigate("/")}
            className="border border-red-500 text-red-700 px-4 py-2 rounded-full flex-1"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Menú fijo inferior en móvil */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
  );
}

export default PanelScout;

