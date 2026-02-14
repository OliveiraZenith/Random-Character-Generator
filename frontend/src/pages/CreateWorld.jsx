import WorldForm from '../components/WorldForm.jsx';

const CreateWorld = () => {
  return (
    <div className="register-page" role="presentation">
      <div className="register-overlay" aria-hidden />
      <div className="register-particles" aria-hidden />
      <div className="register-content worlds-wrapper">
        <WorldForm />
      </div>
    </div>
  );
};

export default CreateWorld;
