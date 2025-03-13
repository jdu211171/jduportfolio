import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import AppRoutes from "./routes";
import { UserProvider } from "./contexts/UserContext";
import { AlertProvider } from "./contexts/AlertContext";
import { LanguageProvider } from "./contexts/LanguageContext"; // Новый контекст языка

import theme from "./styles/theme";
import "./styles/index.css";
import "./assets/fonts/fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AlertProvider>
        <UserProvider>
          <LanguageProvider>
            <AppRoutes />
          </LanguageProvider>
        </UserProvider>
      </AlertProvider>
    </ThemeProvider>
  </React.StrictMode>
);
