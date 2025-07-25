import { useNavigate } from "react-router-dom";

export default function MenuFijoGrupo() {
  const navigate = useNavigate();

  return (
    <>
      {/* Móvil */}
      <div className="lg:hidden fixed bottom-0 w-full bg-violet-800 text-white flex justify-around py-2 z-50">
        <button onClick={() => navigate("/grupo")} className="text-sm">Inicio</button>
        <button onClick={() => navigate("/grupo/unidades")} className="text-sm">Unidades</button>
        <button onClick={() => navigate("/lista-eventos-grupo")} className="text-sm">Eventos</button>
      </div>

      {/* Escritorio */}
      <div className="hidden lg:flex fixed top-0 left-0 w-full bg-violet-800 text-white justify-center py-2 z-50">
        <button onClick={() => navigate("/grupo")} className="mx-6 text-base">Inicio</button>
        <button onClick={() => navigate("/grupo/unidades")} className="mx-6 text-base">Unidades</button>
        <button onClick={() => navigate("/lista-eventos-grupo")} className="mx-6 text-base">Eventos</button>
      </div>
    </>
  );
}
