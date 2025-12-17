import React, { useState } from "react";

const EditorDetallado = ({ contract, account, onPrepare, showNotification }) => {
  const [idBusqueda, setIdBusqueda] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatTimestampToDateInput = (timestampStr) => {
    const timestamp = Number(timestampStr);
    if (timestamp === 0) return "";
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const cargarPerfil = async () => {
    if (!idBusqueda) return showNotification("Introduce el ID Persona", 'error');
    setLoading(true);
    try {
      const result = await contract.methods.obtenerPersonaPorId(idBusqueda).call();
      const idStr = String(result.id || 0);

      if (result && result.nombres && result.nombres !== "" && idStr === idBusqueda) {
        setForm({
          id: idStr,
          cedula: result.cedula,
          nombres: result.nombres,
          apellidos: result.apellidos,
          genero: Number(result.genero),
          fechaNacimiento: formatTimestampToDateInput(result.fechaNacimiento),
          lugarNacimiento: result.lugarNacimiento || "",
          estadoCivil: result.estadoCivil || "Soltero(a)",
          direccion: result.direccion || "",
          telefono: result.telefono || "",
          profesion: result.profesion || ""
        });
        showNotification(`Datos de ID ${idBusqueda} cargados`, 'success');
      } else {
        showNotification("ID no encontrado", 'error');
        setForm(null);
      }
    } catch (err) {
      showNotification("Error al buscar ID", 'error');
    } finally {
      setLoading(false);
    }
  };

  const guardar = () => {
    try {
      // Validación de Teléfono (Regex corregido)
      const telRegex = /^[0-9+\s]{7,15}$/;
      if (form.telefono && !telRegex.test(form.telefono.trim())) {
        return showNotification("Teléfono no válido (mínimo 7 números)", "error");
      }

      const timestamp = form.fechaNacimiento
        ? Math.floor(new Date(form.fechaNacimiento).getTime() / 1000)
        : 0;

      const method = contract.methods.registrarPersona(
        form.id,               
        form.nombres.trim(),          
        form.apellidos.trim(),        
        form.cedula,           
        Number(form.genero),   
        timestamp,             
        form.lugarNacimiento.trim(),  
        form.estadoCivil,      
        form.direccion.trim(),        
        form.telefono.trim(),         
        form.profesion.trim(),        
        account                
      );

      onPrepare(method);
    } catch (error) {
      showNotification("Error en el formato de datos", "error");
    }
  };

  const inputStyle = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3 outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-medium";
  const labelStyle = "text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block";

  return (
    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black text-xs">02</div>
        <h2 className="text-xl font-black italic text-gray-800 tracking-tight">Completar Perfil</h2>
      </div>

      <div className="flex gap-2 mb-8 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
        <div className="flex-1">
          <label className="text-[10px] font-black text-indigo-400 uppercase ml-1 mb-1 block">ID de la Persona</label>
          <input 
            type="number"
            className="w-full p-3 bg-white border border-indigo-200 rounded-xl outline-none font-bold text-indigo-600"
            value={idBusqueda}
            onChange={(e) => setIdBusqueda(e.target.value)}
          />
        </div>
        <button onClick={cargarPerfil} disabled={loading} className="self-end px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 active:scale-95 transition-all">
          {loading ? "..." : "CARGAR"}
        </button>
      </div>

      {form ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 animate-in fade-in slide-in-from-top-2">
          <div className="md:col-span-2 mb-2"><label className={labelStyle}>Cédula (Estática)</label><input className={inputStyle + " bg-gray-100 text-gray-500 cursor-not-allowed"} value={form.cedula} readOnly /></div>
          
          <div><label className={labelStyle}>Nombres</label><input className={inputStyle} value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} /></div>
          <div><label className={labelStyle}>Apellidos</label><input className={inputStyle} value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} /></div>
          
          <div>
            <label className={labelStyle}>Género</label>
            <select className={inputStyle} value={form.genero} onChange={e => setForm({...form, genero: e.target.value})}>
              <option value={0}>Masculino</option>
              <option value={1}>Femenino</option>
              <option value={2}>Otro</option>
            </select>
          </div>
          <div><label className={labelStyle}>Fecha Nacimiento</label><input type="date" className={inputStyle} value={form.fechaNacimiento} onChange={e => setForm({...form, fechaNacimiento: e.target.value})} /></div>
          
          <div><label className={labelStyle}>Lugar de Nacimiento</label><input className={inputStyle} value={form.lugarNacimiento} onChange={e => setForm({...form, lugarNacimiento: e.target.value})} /></div>
          
          {/* SELECTOR DE ESTADO CIVIL */}
          <div>
            <label className={labelStyle}>Estado Civil</label>
            <select 
                className={inputStyle} 
                value={form.estadoCivil} 
                onChange={e => setForm({...form, estadoCivil: e.target.value})}
            >
              <option value="Soltero(a)">Soltero(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viudo(a)">Viudo(a)</option>
              <option value="Unión Libre">Unión Libre</option>
            </select>
          </div>
          
          <div><label className={labelStyle}>Profesión</label><input className={inputStyle} value={form.profesion} onChange={e => setForm({...form, profesion: e.target.value})} /></div>
          <div><label className={labelStyle}>Teléfono</label><input type="tel" className={inputStyle} value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
          
          <div className="md:col-span-2"><label className={labelStyle}>Dirección</label><input className={inputStyle} value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
          
          <button onClick={guardar} className="md:col-span-2 mt-4 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg hover:bg-green-700 active:scale-95 transition-all">
            GUARDAR CAMBIOS EN BLOCKCHAIN
          </button>
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-gray-50 rounded-3xl">
          <p className="text-gray-300 font-bold italic text-sm">Ingresa un ID para habilitar el formulario.</p>
        </div>
      )}
    </section>
  );
};

export default EditorDetallado;