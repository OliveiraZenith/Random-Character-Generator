import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Worlds from './pages/Worlds.jsx';
import CreateWorld from './pages/CreateWorld.jsx';
import Characters from './pages/Characters.jsx';
import CharacterView from './pages/CharacterView.jsx';
import TransitionOverlay from './components/TransitionOverlay.jsx';
import faviconUrl from './imagens/fiveIcon.png';
import fundoLoginImage from './imagens/fundoLogin.jpg';
import './styles/global.css';

const App = () => {
  const path = window.location.pathname;
  if (/^\/characters\/\d+/.test(path)) return <CharacterView />;
  if (/^\/worlds\/\d+\/characters/.test(path)) return <Characters />;
  if (path.includes('register')) return <Register />;
  if (path.includes('worlds/create')) return <CreateWorld />;
  if (path.includes('worlds')) return <Worlds />;
  return <Login />;
};

const ensureFavicon = () => {
  const existing = document.querySelector("link[rel~='icon']");
  const link = existing || document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = faviconUrl;
  if (!existing) {
    document.head.appendChild(link);
  }
};

ensureFavicon();

// Resolve background image through Vite and expose to CSS.
document.documentElement.style.setProperty('--bg-login-image', `url(${fundoLoginImage})`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <TransitionOverlay />
      <App />
    </>
  </React.StrictMode>
);
