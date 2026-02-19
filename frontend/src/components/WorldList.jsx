import WorldCard from './WorldCard.jsx';

const WorldList = ({ worlds, onOpen, onEdit, onDelete, onOpenGrid }) => {
  if (!worlds.length) {
    return <div className="worlds-empty">Nenhum mundo ainda. Crie o primeiro!</div>;
  }

  return (
    <div className="worlds-list">
      {worlds.map((world) => (
        <WorldCard
          key={world.id}
          world={world}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenGrid={onOpenGrid}
        />
      ))}
    </div>
  );
};

export default WorldList;
