import CharacterCard from './CharacterCard.jsx';

const CharacterList = ({ characters, onEdit, onDelete, disabled }) => {
  if (!characters.length) {
    return <div className="characters-empty">Nenhum personagem criado neste mundo.</div>;
  }

  return (
    <div className="characters-list">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default CharacterList;
