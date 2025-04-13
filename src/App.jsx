import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react"
import * as ROUTES from "./constants/routes";
import Registration from "./pages/Registration/Registration";
import Playlists from "./pages/Playlists/Playlists";
import Outfit from "./pages/Outfit/Outfit";
import "./App.css";


const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path={ROUTES.HOME} element={<Registration />} />
        <Route path={ROUTES.PLAYLISTS} element={<Playlists />} />
        <Route path={ROUTES.OUTFIT} element={<Outfit />} />
      </Routes>
    </Router>
    <Analytics></Analytics>
    </>
  );
};

export default App;
