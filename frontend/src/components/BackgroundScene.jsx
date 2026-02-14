const BackgroundScene = ({ children }) => {
  return (
    <div className="register-page" role="presentation">
      <div className="register-overlay" aria-hidden />
      <div className="register-particles" aria-hidden />
      <div className="register-content">{children}</div>
    </div>
  );
};

export default BackgroundScene;
