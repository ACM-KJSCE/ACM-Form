import {  RouterProvider } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import "./App.css";
import router from "./configs/router";
import { clarity } from 'react-microsoft-clarity'


function App() {
  clarity.init('rhuukpshtr')
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;
