export default function Dashboard() {
  // Datos ficticios
  const account = "0x1234...abcd";
  const balance = "12.5";
  const ciTestador = "V-12345678";

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <p>
        <strong>Cuenta conectada:</strong> {account}
      </p>
      <p>
        <strong>Balance del contrato:</strong> {balance} ETH
      </p>
      <p>
        <strong>CI del Testador:</strong> {ciTestador}
      </p>
    </div>
  );
}
