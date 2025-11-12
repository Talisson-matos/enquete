// components/Liberacao.tsx (com formatação de placas)
import React from 'react';
import { copiar } from '../utils/copy';
import { formatPlaca } from '../utils/formatPlaca';

interface Props {
  formData: any;
}

const Liberacao: React.FC<Props> = ({ formData }) => {
  const campos = [
    formData.nomeMotorista,
    formatPlaca(formData.placaCavalo),
    formatPlaca(formData.placaReboque),
    formatPlaca(formData.placaReboque2),
    formData.linha,
  ].filter(Boolean);

  return (
    <div className="aba-liberacao">
      <h3>Liberação</h3>
      <div className="botoes-liberacao">
        {campos.map((texto, i) => (
          <button key={i} onClick={() => copiar(texto, 'Liberação')} className="btn-copiar">
            {texto}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Liberacao;