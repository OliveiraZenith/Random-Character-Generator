const WorldCard = ({ world, onOpen, onEdit, onDelete, onOpenGrid }) => {
  return (
    <div className="world-card glow-hover fade-in" onClick={() => onOpen(world)} role="button" tabIndex={0}>
      <div className="world-card-content">
        <span className="world-name">{world.name}</span>
        <div className="world-actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn" type="button" aria-label="Editar" onClick={() => onEdit(world)}>
            ✏️
          </button>
          <button className="icon-btn" type="button" aria-label="Excluir" onClick={() => onDelete(world)}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorldCard;
