import {  RouterProvider } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";
import router from "./configs/router";

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
