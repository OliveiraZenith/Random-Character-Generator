const EditableField = ({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  options = [],
  rows = 4,
  name
}) => {
  const commonProps = {
    className: 'parchment-input',
    value: value ?? '',
    placeholder,
    onChange: (e) => onChange(e.target.value),
    name
  };

  if (type === 'textarea') {
    return (
      <div className="field-stack">
        <label className="parchment-label" htmlFor={name}>{label}</label>
        <textarea id={name} rows={rows} {...commonProps} />
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="field-stack">
        <label className="parchment-label" htmlFor={name}>{label}</label>
        <select id={name} {...commonProps}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="field-stack">
      <label className="parchment-label" htmlFor={name}>{label}</label>
      <input id={name} type={type} {...commonProps} />
    </div>
  );
};

export default EditableField;
