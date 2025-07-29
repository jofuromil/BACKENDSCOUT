import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuFijo from "../components/MenuFijo";

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

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col pb-20">
      {/* Menú fijo superior para pantallas grandes */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <h1 className="text-3xl font-bold mb-6">⚔️ Panel del Scout</h1>

        <div className="bg-green-100 p-4 rounded-xl mb-6">
          <p><strong>Scout:</strong> {nombreScout}</p>
          <p><strong>Rama:</strong> {rama}</p>
          {unidadInfoVisible && (
            <>
              <p><strong>Unidad:</strong> {nombreUnidad}</p>
              <p><strong>Código de unidad:</strong> {codigoUnidad}</p>
            </>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Objetivos Educativos</h2>
          <button
            onClick={() => navigate("/objetivos-nivel")}
            className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
          >
            Seleccionar Objetivos
          </button>
          <button
            onClick={() => navigate("/scout/objetivos")}
            className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
          >
            Ver Objetivos Educativos
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Especialidades</h2>
          <button
            onClick={() => navigate("/registrar-avance-especialidades")}
            className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
          >
            Registrar Avance de Especialidades
          </button>
          <button
            onClick={() => navigate("/mis-especialidades")}
            className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
          >
            Ver Mis Especialidades
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Eventos</h2>
          <button
            onClick={() => navigate("/scout/eventos")}
            className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full"
          >
            Ver Eventos Disponibles
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Comunicaciones</h2>
          <button
            onClick={() => navigate("/mensajes-recibidos")}
            className="border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-full w-full mb-2"
          >
            Ver Mensajes de la Unidad
          </button>
          <button
            onClick={() => navigate("/scout/ver-mensajesA")}
            className="border-2 border-blue-600 text-blue-700 px-4 py-2 rounded-full w-full"
          >
            Ver Mensajes del Grupo
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Cuenta</h2>
          <button
            onClick={() => navigate("/perfil")}
            className="border-2 border-gray-600 text-gray-700 px-4 py-2 rounded-full w-full mb-2"
          >
            Ver / Editar Perfil
          </button>
          <button
            onClick={() => navigate("/")}
            className="border-2 border-red-600 text-red-700 px-4 py-2 rounded-full w-full"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Menú fijo inferior en móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijo />
      </div>
    </div>
  );
}

export default PanelScout;
