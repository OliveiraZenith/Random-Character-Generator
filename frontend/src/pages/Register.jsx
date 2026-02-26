import { useEffect } from 'react';
import BackgroundScene from '../components/BackgroundScene.jsx';
import RegisterForm from '../components/RegisterForm.jsx';
import { setPageMeta } from '../services/seo.js';

const Register = () => {
  useEffect(() => {
    setPageMeta({
      title: 'Criar Conta | Random Character Creator',
      description: 'Crie sua conta para começar a forjar mundos e personagens épicos.',
      url: window.location.href
    });
  }, []);

  return (
    <BackgroundScene>
      <RegisterForm />
    </BackgroundScene>
  );
};

export default Register;
