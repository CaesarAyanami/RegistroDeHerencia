export default function DAppPersonaHerencia() {
  const activarFallecimiento = () =>
    alert("Mock: Fallecimiento activado en contrato");
  const distribuirHerencia = () =>
    alert("Mock: Herencia distribuida a beneficiarios");

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Gestión de Herencia</h2>
      <button
        onClick={activarFallecimiento}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-4"
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
