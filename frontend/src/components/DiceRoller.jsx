import { useEffect, useMemo, useRef, useState } from 'react';
import diceIcon from '../imagens/icons/dado-Icon.svg';
import searchIcon from '../imagens/icons/lupa-Icon.svg';

const allowedDice = new Set([2, 4, 6, 8, 10, 20, 100]);
const maxDicePerGroup = 50;

const examples = [
  {
    title: 'Exemplo 1',
    input: '2d10',
    description: 'Isso jogará dois dados de dez lados'
  },
  {
    title: 'Exemplo 2',
    input: '3d20 + 5',
    description: 'Isso jogará três dados de vinte lados e somará 5 em cada resultado do dado'
  },
  {
    title: 'Exemplo 3',
    input: '3d20 + 5; 2d10 - 2',
    description: 'Isso jogará três dados de vinte lados e somará 5 em cada resultado, e também jogará dois dados de dez lados tirando 2 de cada resultado'
  }
];

const sanitize = (value = '') => value.replace(/;+$/g, '').trim();

const rollGroup = (group) => {
  const match = group.match(/^(\d+)\s*d\s*(2|4|6|8|10|20|100)(?:\s*([+-])\s*(\d+))?$/i);
  if (!match) {
    throw new Error('Formato inválido. Use algo como 2d10 + 5');
  }

  const quantity = Number(match[1]);
  const faces = Number(match[2]);
  const sign = match[3];
  const modifier = sign ? Number(match[4]) : 0;

  if (!allowedDice.has(faces)) {
    throw new Error('Tipo de dado não suportado');
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxDicePerGroup) {
    throw new Error('Quantidade de dados inválida');
  }

  const rolls = Array.from({ length: quantity }, () => 1 + Math.floor(Math.random() * faces));
  const results = rolls.map((roll) => {
    if (!sign) return { base: roll, adjusted: roll, expression: `${roll}` };
    const adjusted = sign === '+' ? roll + modifier : roll - modifier;
    return { base: roll, adjusted, expression: `(${roll}${sign}${modifier})` };
  });

  const total = results.reduce((sum, item) => sum + item.adjusted, 0);

  return { faces, quantity, modifier, sign, results, total, raw: group };
};

const rollExpression = (value) => {
  const cleaned = sanitize(value);
  if (!cleaned) {
    throw new Error('Digite algo como 2d10 + 5');
  }

  const groups = cleaned
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(rollGroup);

  const total = groups.reduce((sum, group) => sum + group.total, 0);

  return { groups, total };
};

const DiceRoller = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const defaultPlaceholder = useMemo(() => 'Ex: 2d10 + 5; 1d20 - 2', []);

  const close = () => {
    setOpen(false);
    setError('');
  };

  const handleRoll = () => {
    try {
      const rolled = rollExpression(value);
      setResult(rolled);
      setError('');
    } catch (err) {
      setResult(null);
      setError(err.message || 'Erro ao rolar dados');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleRoll();
  };

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Enter' && event.target === inputRef.current) {
        event.preventDefault();
        handleRoll();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, value]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="dice-toggle"
        aria-label="Abrir rolagem de dados"
        onClick={() => setOpen(true)}
      >
        <img src={diceIcon} alt="Ícone de dado" />
      </button>

      {open && (
        <div className="dice-overlay" role="dialog" aria-modal="true" onClick={close}>
          <div className="dice-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dice-close" type="button" aria-label="Fechar" onClick={close}>✕</button>
            <h3 className="dice-title">Digite quantos e quais dados deseja jogar:</h3>

            <form className="dice-input-row" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                className="dice-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={defaultPlaceholder}
                aria-label="Expressão de dados"
              />
              <button className="dice-action" type="submit" aria-label="Rolar dados">
                <img src={searchIcon} alt="Rolar" />
              </button>
            </form>

            {error && <div className="dice-error" role="alert">{error}</div>}

            <div className="dice-result">
              <div className="dice-result-header">Resultado:</div>
              {result?.groups?.length ? (
                <div className="dice-breakdown-list">
                  {result.groups.map((group, index) => (
                    <div key={`${group.raw}-${index}`} className="dice-group-row">
                      <div className="dice-group-rolls">
                        {group.results.map((item, idx) => (
                          <span key={`${item.expression}-${idx}`} className="dice-roll-chip">
                            <span className="dice-roll-formula">{item.expression}=</span>
                            <span className="dice-roll-value">{item.adjusted}</span>
                          </span>
                        ))}
                        <span className="dice-group-total">Total do grupo: {group.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dice-placeholder">Digite uma expressão para ver o resultado</div>
              )}

              <div className="dice-total">Total: {result?.total ?? 0}</div>
            </div>

            <div className="dice-examples">
              <div className="dice-examples-title">Exemplos:</div>
              <div className="dice-examples-grid">
                {examples.map((example) => (
                  <div key={example.title} className="dice-example-card">
                    <div className="dice-example-title">{example.title}</div>
                    <div className="dice-example-input">Digite: {example.input}</div>
                    <div className="dice-example-text">{example.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiceRoller;
