import { useEffect } from 'react';
import HeroSection from '../components/HeroSection.jsx';
import LoginForm from '../components/LoginForm.jsx';
import { setPageMeta } from '../services/seo.js';

const Login = () => {
  useEffect(() => {
    setPageMeta({
      title: 'Entrar | Random Character Creator',
      description: 'Acesse sua conta e continue criando seus mundos, personagens e histórias.',
      url: window.location.href
    });
  }, []);

  return (
    <div className="page-shell">
      <HeroSection />
      <section className="login-panel">
        <LoginForm />
      </section>
    </div>
  );
};

export default Login;
