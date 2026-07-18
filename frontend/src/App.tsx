import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import DoctorPortal from "./pages/DoctorPortal";
import NurseStation from "./pages/NurseStation";
import PatientHistory from "./pages/PatientHistory";
import PatientMonitor from "./pages/PatientMonitor";
import SystemStatus from "./pages/SystemStatus";

export default function App() {
  return (
    <div className="min-h-screen bg-hospital-bg text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 pb-8 pt-4 md:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitor" element={<PatientMonitor />} />
            <Route path="/monitor/:patientId" element={<PatientMonitor />} />
            <Route path="/nurse-station" element={<NurseStation />} />
            <Route path="/doctor-portal" element={<DoctorPortal />} />
            <Route path="/history" element={<PatientHistory />} />
            <Route path="/system-status" element={<SystemStatus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
