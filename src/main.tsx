import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { CssBaseline } from "@mui/material";
import { AuthProvider } from "./components/AuthProvider.tsx";
import "@fontsource/roboto/200.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/700.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <CssBaseline />
      <App />
    </AuthProvider>
  </BrowserRouter>,
);
