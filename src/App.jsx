import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as ROUTES from "./constants/routes";
import "./App.css";
import Home from "./pages/Home";
import Playlists from "./pages/Playlists";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <Home />
          }
        />
        <Route
          path={ROUTES.PLAYLISTS}
          element={
            <Playlists />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
