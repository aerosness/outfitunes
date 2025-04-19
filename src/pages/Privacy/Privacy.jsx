import React from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import "./Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-wrapper">
      <div className="privacy-container">
        <h1>PRIVACY POLICY</h1>
        
        <div className="privacy-section">
          <h2>Last Updated: April 19, 2025</h2>
          
          <p>Welcome to Outfitunes. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we handle data when you use our application.</p>
        </div>

        <div className="privacy-section">
          <h2>1. Information We Collect</h2>
          <p>When you connect your Spotify account, we request access to:</p>
          <ul>
            <li>Your Spotify display name</li>
            <li>Your playlists (names, cover images, and contents)</li>
            <li>Your currently playing track and playback state</li>
          </ul>
          <p>We only access the data that Spotify provides through their API with the scopes you explicitly authorize. We do not collect or store any passwords.</p>
        </div>

        <div className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul>
            <li>Display your Spotify playlists within our application</li>
            <li>Analyze playlist contents to generate personalized outfits based on music genres</li>
            <li>Personalize your experience by displaying your username</li>
          </ul>
          <p>Your data is processed locally in your browser. We do not store your playlists or listening history on our servers.</p>
        </div>

        <div className="privacy-section">
          <h2>3. Data Storage</h2>
          <p>We store your Spotify access token temporarily in your browser's local storage. This token expires after a limited time and is only used to communicate with Spotify's API on your behalf.</p>
          <p>The token is automatically cleared when you close the application or when it expires.</p>
        </div>

        <div className="privacy-section">
          <h2>4. Third-Party Services</h2>
          <p>Our service integrates with Spotify. When you connect your Spotify account, you are also subject to Spotify's Privacy Policy and Terms of Service.</p>
          <p>We do not share your data with any other third parties.</p>
        </div>

        <div className="privacy-section">
          <h2>5. Images and Content</h2>
          <p>The outfit images we generate are based solely on the genre analysis of your playlists. You can download these images to your device.</p>
          <p>We do not claim ownership of your playlist information or any Spotify content.</p>
        </div>

        <div className="privacy-section">
          <h2>6. Your Rights</h2>
          <p>You have the right to disconnect your Spotify account at any time by logging out of the application.</p>
          <p>Since we don't store your data on our servers, there is no need for a data deletion request process.</p>
        </div>

        <div className="privacy-section">
          <h2>7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        </div>

        <div className="privacy-section">
          <h2>8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at: outfitunes@gmail.com</p>
        </div>

        <div className="privacy-nav">
          <Link to="/" className="privacy-button">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;