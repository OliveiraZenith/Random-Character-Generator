import { useEffect, useState } from 'react';
import { navigateWithTransition } from '../services/navigation.js';

const SidebarNav = ({ worldId }) => {
  const [open, setOpen] = useState(false);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const safePath = (path, fallback = '/worlds') => (worldId ? path : fallback);

  const baseItems = [
    { id: 'worlds', label: 'Mundos', href: '/worlds' },
    { id: 'characters', label: 'Personagens', href: safePath(`/worlds/${worldId}/characters`) },
    { id: 'grid', label: 'Grid', href: safePath(`/worlds/${worldId}/grid`) },
    { id: 'back', label: 'Voltar', href: '/worlds' },
    { id: 'logout', label: 'Sair', href: '/login' },
  ];

  const items = baseItems;

  const isActive = (href) => {
    const normalize = (value) => (value || '').replace(/\/+$/, '') || '/';
    const target = normalize(href);
    const current = normalize(pathname);

    if (target === '/worlds') return current === '/worlds';
    if (target === '/login') return current === '/login';
    if (target === '/') return current === '/';
    return current.startsWith(target);
  };

  const handleNavigate = (href) => {
    close();
    navigateWithTransition(href);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className={`nav-toggle ${open ? 'active' : ''}`}
          aria-label="Abrir menu lateral"
          onClick={toggle}
        >
          ☰
        </button>
      )}

      {open && <div className="nav-overlay" onClick={close} aria-hidden />}

      <aside className={`nav-sidebar ${open ? 'open' : ''}`} role="navigation" aria-label="Menu principal">
        <button className="nav-close" type="button" aria-label="Fechar menu" onClick={close}>✕</button>
        <div className="nav-items">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => handleNavigate(item.href)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
