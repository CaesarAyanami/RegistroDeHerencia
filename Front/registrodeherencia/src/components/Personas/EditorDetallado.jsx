import React, { useState } from "react";

const EditorDetallado = ({
  contract,
  account,
  onPrepare,
  showNotification,
}) => {
  const [idBusqueda, setIdBusqueda] = useState("");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE FORMATEO INTACTA ---
  const formatTimestampToDateInput = (timestampStr) => {
    const timestamp = Number(timestampStr);
    if (timestamp === 0) return "";
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // --- LÓGICA DE CARGA INTACTA ---
  const cargarPerfil = async () => {
    if (!idBusqueda)
      return showNotification("Introduce el ID Persona", "error");
    setLoading(true);
    try {
      const result = await contract.methods
        .obtenerPersonaPorId(idBusqueda)
        .call();
      const idStr = String(result.id || 0);

      if (
        result &&
        result.nombres &&
        result.nombres !== "" &&
        idStr === idBusqueda
      ) {
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
          profesion: result.profesion || "",
        });
        showNotification(`Datos de ID ${idBusqueda} cargados`, "success");
      } else {
        showNotification("ID no encontrado", "error");
        setForm(null);
      }
    } catch (err) {
      showNotification("Error al buscar ID", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE GUARDADO INTACTA ---
  const guardar = () => {
    try {
      const telRegex = /^[0-9+\s]{7,15}$/;
      if (form.telefono && !telRegex.test(form.telefono.trim())) {
        return showNotification(
          "Teléfono no válido (mínimo 7 números)",
          "error"
        );
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

  // --- ESTILOS DARK TECH ---
  const inputStyle =
    "w-full p-4 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all text-sm font-bold text-white placeholder:text-gray-700";
  const labelStyle =
    "text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block";

  return (
    <section className="bg-[#0d0f14] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Indicador lateral de sección */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-green-600/40 shadow-[0_0_15px_rgba(22,163,74,0.3)]"></div>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 bg-green-600/10 border border-green-500/20 text-green-500 rounded-xl flex items-center justify-center font-black text-xs italic shadow-[0_0_20px_rgba(34,197,94,0.1)]">
          02
        </div>
        <div>
          <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
            Editor de Perfiles
          </h2>
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
            Sincronización de Identidad Civil
          </p>
        </div>
      </div>

      {/* Buscador de ID Estilizado */}
      <div className="flex flex-col md:flex-row gap-3 mb-12 bg-black/20 p-3 rounded-[2rem] border border-white/5">
        <div className="flex-1 px-4 py-2">
          <label className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 block">
            Descriptor de Identidad (ID)
          </label>
          <input
            type="number"
            className="w-full bg-transparent outline-none font-black text-lg text-white placeholder:text-gray-800"
            placeholder="000"
            value={idBusqueda}
            onChange={(e) => setIdBusqueda(e.target.value)}
          />
        </div>
        <button
          onClick={cargarPerfil}
          disabled={loading}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Sincronizando..." : "Extraer Datos"}
        </button>
      </div>

      {form ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Cédula Bloqueada con Estilo Tech */}
          <div className="md:col-span-2 group">
            <label className={labelStyle}>Cédula (Registro Inmutable)</label>
            <div className="relative">
              <input
                className={
                  inputStyle +
                  " bg-white/5 border-dashed text-gray-500 cursor-not-allowed"
                }
                value={form.cedula}
                readOnly
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-700 uppercase tracking-widest">
                Locked
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Nombres</label>
            <input
              className={inputStyle}
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Apellidos</label>
            <input
              className={inputStyle}
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Género</label>
            <select
              className={inputStyle + " appearance-none"}
              value={form.genero}
              onChange={(e) => setForm({ ...form, genero: e.target.value })}
            >
              <option value={0} className="bg-[#0d0f14]">
                Masculino
              </option>
              <option value={1} className="bg-[#0d0f14]">
                Femenino
              </option>
              <option value={2} className="bg-[#0d0f14]">
                Otro
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Fecha Nacimiento</label>
            <input
              type="date"
              className={inputStyle}
              value={form.fechaNacimiento}
              onChange={(e) =>
                setForm({ ...form, fechaNacimiento: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Lugar de Origen</label>
            <input
              className={inputStyle}
              value={form.lugarNacimiento}
              onChange={(e) =>
                setForm({ ...form, lugarNacimiento: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Estado Civil</label>
            <select
              className={inputStyle + " appearance-none"}
              value={form.estadoCivil}
              onChange={(e) =>
                setForm({ ...form, estadoCivil: e.target.value })
              }
            >
              <option value="Soltero(a)" className="bg-[#0d0f14]">
                Soltero(a)
              </option>
              <option value="Casado(a)" className="bg-[#0d0f14]">
                Casado(a)
              </option>
              <option value="Divorciado(a)" className="bg-[#0d0f14]">
                Divorciado(a)
              </option>
              <option value="Viudo(a)" className="bg-[#0d0f14]">
                Viudo(a)
              </option>
              <option value="Unión Libre" className="bg-[#0d0f14]">
                Unión Libre
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Profesión / Oficio</label>
            <input
              className={inputStyle}
              value={form.profesion}
              onChange={(e) => setForm({ ...form, profesion: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className={labelStyle}>Contacto Telefónico</label>
            <input
              type="tel"
              className={inputStyle}
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className={labelStyle}>Dirección Domiciliaria</label>
            <input
              className={inputStyle}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
          </div>

          {/* Botón de Guardado Potente */}
          <button
            onClick={guardar}
            className="md:col-span-2 mt-8 group relative overflow-hidden py-5 bg-white text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-green-500/10 transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 group-hover:text-white transition-colors">
              Confirmar Actualización en Ledger
            </span>
          </button>
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-black/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-bold italic text-[10px] uppercase tracking-[0.2em]">
            Esperando ID para inicializar terminal...
          </p>
        </div>
      )}
    </section>
  );
};

export default EditorDetallado;
