import EditableField from './EditableField.jsx';
import SaveButton from './SaveButton.jsx';

const genderOptions = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' }
];

const CharacterDetails = ({ name, form, onFieldChange, onSave, onBack, loading, dirty, message, error }) => {
  return (
    <div className="character-view">
      <div className="character-view-header">
        <h1 className="character-view-title">{name || 'Personagem'}</h1>
        <p className="character-view-subtitle">Edite os detalhes do personagem</p>
      </div>

      <div className="character-view-body">
        <EditableField
          label="Nome"
          name="name"
          placeholder="Digite o nome do personagem"
          value={form.name || ''}
          onChange={(val) => onFieldChange('name', val)}
        />

        <EditableField
          label="Tags (separe por vírgula)"
          name="tags"
          placeholder="mago, vilão, npc, principal"
          value={form.tags || ''}
          onChange={(val) => onFieldChange('tags', val)}
        />

        {form.tags && (
          <div className="chip-row chip-row-compact" aria-label="Tags atuais">
            {form.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => (
                <span key={tag} className="chip chip-ghost">{tag.toLowerCase()}</span>
              ))}
          </div>
        )}
        <EditableField
          label="Gênero"
          name="gender"
          type="select"
          options={genderOptions}
          value={form.gender}
          onChange={(val) => onFieldChange('gender', val)}
        />

        <EditableField
          label="Raça"
          name="race"
          placeholder="Humano, elfo, orc..."
          value={form.race || ''}
          onChange={(val) => onFieldChange('race', val)}
        />

        <EditableField
          label="Aparência"
          name="appearance"
          type="textarea"
          rows={4}
          placeholder="Traços, vestes, cicatrizes..."
          value={form.appearance || ''}
          onChange={(val) => onFieldChange('appearance', val)}
        />

        <EditableField
          label="História"
          name="history"
          type="textarea"
          rows={5}
          placeholder="Passado, motivações, segredos..."
          value={form.history || ''}
          onChange={(val) => onFieldChange('history', val)}
        />
      </div>

      <div className="character-view-footer">
        <SaveButton onClick={onSave} loading={loading} disabled={!dirty}>
          Salvar
        </SaveButton>
        <button className="button-secondary" type="button" onClick={onBack}>
          Voltar
        </button>
        {message && <div className="toast success" role="status">{message}</div>}
        {error && <div className="toast error" role="alert">{error}</div>}
      </div>
    </div>
  );
};

export default CharacterDetails;
