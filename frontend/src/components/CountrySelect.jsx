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
        <svg
          className="icon-search"
          aria-hidden
          focusable="false"
          viewBox="0 0 24 24"
          width="18"
          height="18"
        >
          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="15.5" y1="15.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
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
