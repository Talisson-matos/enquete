// components/SolicitacaoPedagio.tsx (mudado para texto formatado com botão copiar tudo)
import React from 'react';
import { copiar } from '../utils/copy';
import { formatPlaca } from '../utils/formatPlaca';

interface Props {
  formData: any;
}

const SolicitacaoPedagio: React.FC<Props> = ({ formData }) => {
  const textoFormatado = `
PEDAGIO FILIAL: ${formData.filial}
MDFE: ${formData.mdfe}
MOTORISTA: ${formData.nomeMotorista}
PLACAS: ${formatPlaca(formData.placaCavalo)}
EIXOS: ${formData.eixos}
LINHA: ${formData.linha}
CARTÃO:
VALOR:
FATURADO: SAMID
CPF/CNPJ PROPRIETÁRIO ANTT: ${formData.proprietarioANTT}
`.trim();

  return (
    <div className="aba-pedagio">
      <h3>Solicitação de Pedágio</h3>
      <pre className="texto-formatado">{textoFormatado}</pre>
      <button onClick={() => copiar(textoFormatado, 'Solicitação de Pedágio')} className="btn-copiar-tudo">
        Copiar Tudo 📋
      </button>
    </div>
  );
};

export default SolicitacaoPedagio;