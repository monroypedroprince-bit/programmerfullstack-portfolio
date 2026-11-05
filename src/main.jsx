import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import EducationPage from "./EducationPage.jsx";
import AssistantPage from "./AssistantPage.jsx";
import TravelPage from "./TravelPage.jsx";
import FloatingTerciolpeloChat from "./components/FloatingTerciolpeloChat.jsx";
import "./styles.css";

const route = window.location.pathname.toLowerCase().replace(/\/+$/, "");
const Page = route === "/plataformaeducativa"
  ? EducationPage
  : route === "/asistenteconia"
    ? AssistantPage
    : route === "/travel"
      ? TravelPage
      : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode><><Page />{(route === "" || route === "/index.html") && <FloatingTerciolpeloChat />}</></React.StrictMode>
);
