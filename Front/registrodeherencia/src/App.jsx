import React from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import PersonasComponent from "./components/Personas";
import Propiedad from "./components/Propiedad";
import Heredero from "./components/Heredero";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-8">
        <PersonasComponent />
        <Propiedad />
        <Heredero />
      </main>
    </div>
  );
}

export default App;
