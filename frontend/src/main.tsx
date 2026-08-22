import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { loadPatients } from "./services/api";
import "./styles.css";

// Load real patients from the backend into the cache before rendering,
// so sync API functions (getPatients, getPatient, getPriorityPatient)
// return real database data instead of static mock fixtures.
loadPatients().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
});
