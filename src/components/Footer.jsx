import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Footer.css"; // Этот файл для футера, но основной CSS в глобальном файле

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isLoggedInPage = ["/playlists", "/outfit"].includes(location.pathname);

  return (
    <div className="footer-bar">
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link"
      >
        Privacy Policy
      </a>
      {isLoggedInPage && (
        <button
          className="footer-link"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Disconnect Spotify
        </button>
      )}
    </div>
  );
};

export default Footer;
