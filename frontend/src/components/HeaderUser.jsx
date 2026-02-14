const HeaderUser = ({ name }) => {
  return (
    <div className="worlds-header fade-in">
      <h2 className="worlds-greeting">Olá {name || 'Aventureiro'}</h2>
      <p className="worlds-subtitle">Crie seus mundos</p>
    </div>
  );
};

export default HeaderUser;
