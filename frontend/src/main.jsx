import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import GlobalStyle from "./component/GlobalStyle";
import { UserProvider } from "./context/userContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GlobalStyle>
        <UserProvider>
          <App />
        </UserProvider>
      </GlobalStyle>
    </GoogleOAuthProvider>
  </StrictMode>
);
