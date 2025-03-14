import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as ROUTES from "./constants/routes";
import "./App.css";
import NavigationBar from "./components/NavigationBar";
import WebApp from "./pages/WebApp";

const App = () => {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <WebApp />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
