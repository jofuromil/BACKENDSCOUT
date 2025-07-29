import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Users,
  FileCheck,
  ShieldCheck
} from "lucide-react";

export default function MenuFijoDistrito() {
  const navigate = useNavigate();

  return (
    <>
      {/* Pantalla grande (arriba) */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 bg-white shadow z-50 justify-around py-2 border-b">
        <Boton icono={<Home />} texto="Inicio" onClick={() => navigate("/distrito")} />
        <Boton icono={<ClipboardList />} texto="Registros" onClick={() => navigate("/distrito/registros")} />
        <Boton icono={<Users />} texto="Usuarios" onClick={() => navigate("/distrito/usuarios")} />
        <Boton icono={<FileCheck />} texto="Listas" onClick={() => navigate("/distrito/listas")} />
        <Boton icono={<ShieldCheck />} texto="Perfil" onClick={() => navigate("/distrito/perfil")} />
      </div>

      {/* Pantalla pequeña (abajo) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow z-50 flex justify-around py-2 border-t">
        <Boton icono={<Home size={24} />} onClick={() => navigate("/distrito")} />
        <Boton icono={<ClipboardList size={24} />} onClick={() => navigate("/distrito/registros")} />
        <Boton icono={<Users size={24} />} onClick={() => navigate("/distrito/usuarios")} />
        <Boton icono={<FileCheck size={24} />} onClick={() => navigate("/distrito/listas")} />
        <Boton icono={<ShieldCheck size={24} />} onClick={() => navigate("/distrito/perfil")} />
      </div>
    </>
  );
}

function Boton({ icono, texto, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-xs text-purple-700 hover:text-purple-900"
    >
      {icono}
      {texto && <span className="mt-1">{texto}</span>}
    </button>
  );
}
