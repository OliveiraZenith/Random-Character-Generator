const themes = [
  { id: 'fantasia', label: 'Fantasia' },
  { id: 'medieval', label: 'Medieval' },
  { id: 'modern', label: 'Tempos atuais' },
];

const ThemeSelector = ({ value, onChange }) => {
  return (
    <div className="theme-selector">
      <p className="helper-text">Marque apenas uma caixa onde seu mundo se passa</p>
      <div className="theme-options">
        {themes.map((theme) => (
          <label key={theme.id} className="theme-option">
            <input
              type="radio"
              name="world-theme"
              value={theme.id}
              checked={value === theme.id}
              onChange={() => onChange(theme.id)}
            />
            <span className="custom-radio" />
            <span className="theme-label">{theme.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
