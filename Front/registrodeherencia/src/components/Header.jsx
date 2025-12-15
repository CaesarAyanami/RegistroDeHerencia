export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-blue-900 text-white shadow">
      <img
        src="/assets/logo-universidad.png"
        alt="Logo Universidad"
        className="h-12"
      />
      <h1 className="text-2xl font-bold">DApp de Herencias</h1>
    </header>
  );
}
