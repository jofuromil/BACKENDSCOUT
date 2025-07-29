import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuFijoGrupo from "../../components/MenuFijoGrupo";

export default function PanelGrupoScout() {
  const [grupo, setGrupo] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    axios
      .get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsuario(res.data);
        const unidad = res.data.unidad;
        if (unidad) {
          setGrupo({
            nombre: unidad.grupoScout,
            distrito: unidad.distrito
          });
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!grupo || !usuario) return <p className="p-4">Cargando...</p>;

  return (
    <div className="min-h-screen bg-white pb-20 flex flex-col">
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <MenuFijoGrupo />
      </div>

      <div className="max-w-2xl mx-auto p-6 pt-6">
        <h1 className="text-3xl font-bold mb-6">🏕️ Panel del Grupo Scout</h1>

        {/* ✅ Botón de volver */}
        <button
          onClick={() => navigate("/panel-dirigente")}
          className="border-2 border-blue-600 text-blue-700 px-4 py-2 rounded-full w-full mb-6"
        >
          ← Volver al Panel de Dirigente
        </button>

        <div className="bg-violet-100 p-4 rounded-xl mb-6">
          <p><strong>Nombre del Grupo:</strong> {grupo.nombre}</p>
          <p><strong>Distrito:</strong> {grupo.distrito}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Administración del Grupo</h2>
          <button onClick={() => navigate("/grupo/scouts")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full mb-2">
            Ver Scouts del Grupo
          </button>
          <button onClick={() => navigate("/grupo/dirigentes")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full mb-2">
            Ver Dirigentes del Grupo
          </button>
          <button onClick={() => navigate("/grupo/unidades")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full mb-2">
            Ver resumen Unidades del Grupo
          </button>
          <button onClick={() => navigate("/grupo/gestion")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full mb-2">
            Aprobar registros
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Eventos del Grupo</h2>
          <button onClick={() => navigate("/grupo/eventos/nuevo")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full mb-2">
            Crear Evento
          </button>
          <button onClick={() => navigate("/grupo/eventos")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full">
            Ver Lista de Eventos
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Mensajes del Grupo Scout</h2>
          <button onClick={() => navigate("/grupo/enviar-mensaje")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full mb-2">
            Enviar mensaje al Grupo
          </button>
          <button onClick={() => navigate("/grupo/ver-mensajes")} className="border-2 border-violet-600 text-violet-700 px-4 py-2 rounded-full w-full">
            Ver mensajes del Grupo Scout
          </button>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MenuFijoGrupo />
      </div>
    </div>
  );
}
