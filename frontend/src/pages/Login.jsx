import HeroSection from '../components/HeroSection.jsx';
import LoginForm from '../components/LoginForm.jsx';

const Login = () => {
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
