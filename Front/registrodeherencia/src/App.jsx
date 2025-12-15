import React from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ActionButtons from "./components/ActionButtons";
import DAppPersona from "./components/DAppPersona";
import DAppPersonaHerencia from "./components/DAppPersonaHerencia";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-8">
        <Dashboard />
        <ActionButtons />
        <DAppPersona />
        <DAppPersonaHerencia />
      </main>
    </div>
  );
}

export default App;
