import logo from "../assets/IUJOLOGO.png";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-blue-900 to-indigo-700 text-white shadow-2xl border-b-4 border-indigo-400">
      
      <div className="flex items-center space-x-4">
        <div className="bg-white p-2 rounded-xl shadow-lg">
          <img 
            src={logo} 
            alt="Logo Universidad" 
            className="h-10 md:h-12 w-auto" 
          />
        </div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking-wide hidden sm:block">
          Panel de Control
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <h2 className="text-xl md:text-3xl font-extrabold tracking-wide sm:hidden">
        Panel de Control
        </h2>
        <span className="text-2xl md:text-3xl animate-pulse" title="Blockchain Icon">
          &#128165; 
        </span>
      </div>

    </header>
  );
}