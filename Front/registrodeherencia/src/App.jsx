import React from "react";
import Header from "./components/Header";

import { MetamaskLoader } from "./components/Loader/MetamaskLoader";
import { NotificationProvider } from "./context/NotificationContext";

import Personas from "./components/Personas";
import Propiedad from "./components/Propiedad";
import Heredero from "./components/Heredero";
import DashboardHeader from "./components/Dashboard";

function App() {
  return (
    <MetamaskLoader>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-200">
          <Header />
          <DashboardHeader />
          <main className="p-8">
             <Personas /> 
             <Propiedad /> 
            <Heredero /> 
          </main>
        </div>
      </NotificationProvider>
    </MetamaskLoader>
  );
}

export default App;
