const SaveButton = ({ onClick, loading, disabled, children = 'Salvar' }) => {
  return (
    <button
      type="button"
      className={`button-primary ornate-btn ${loading ? 'btn-loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Salvando...' : children}
    </button>
  );
};

export default SaveButton;
