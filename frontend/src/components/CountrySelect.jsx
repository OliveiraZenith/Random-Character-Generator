const COUNTRIES = ['Brasil', 'Canadá', 'Estados Unidos', 'Japão', 'México', 'Reino Unido', 'França', 'Alemanha', 'Austrália'];

const CountrySelect = ({ value, onChange, visible }) => {
  if (!visible) return null;

  return (
    <div className="country-select fade-in">
      <label className="label" htmlFor="country">País que se passa:</label>
      <div className="country-field">
        <input
          id="country"
          className="input country-input"
          placeholder="Buscar o nome do país"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          list="country-list"
        />
        <span className="icon-search" aria-hidden>🔍</span>
        <datalist id="country-list">
          {COUNTRIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="country-scroll">
        {COUNTRIES.filter((c) => c.toLowerCase().includes((value || '').toLowerCase())).map((c) => (
          <button key={c} type="button" className="country-item" onClick={() => onChange(c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountrySelect;
