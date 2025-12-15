export default function ActionButtons() {
  const registrarTestador = () => alert("Mock: Testador registrado");
  const activarFallecimiento = () => alert("Mock: Fallecimiento activado");
  const distribuirHerencia = () => alert("Mock: Herencia distribuida");

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-6">
      <button
        onClick={registrarTestador}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Registrar Testador
      </button>
      <button
        onClick={activarFallecimiento}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Activar Fallecimiento
      </button>
      <button
        onClick={distribuirHerencia}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Distribuir Herencia
      </button>
    </div>
  );
}
