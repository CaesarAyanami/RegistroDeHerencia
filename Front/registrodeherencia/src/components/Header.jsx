import logo from "../assets/IUJOLOGO.png";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-blue-900 text-white shadow">
<<<<<<< HEAD
      <img
        src="/assets/logo_universidad.png"
        alt="Logo Universidad"
        className="h-12"
      />
      <h1 className="text-2xl font-bold">Panel de Control</h1>
=======
      <img src={logo} alt="Logo Universidad" className="h-12" />
      <h1 className="text-2xl font-bold">DApp de Herencias</h1>
>>>>>>> c29747e6668a6d9f169993bcdde92d9bd8d024fc
    </header>
  );
}
