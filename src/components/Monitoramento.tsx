// components/Monitoramento.tsx (já tinha para cavalo, agora para todas)
import React from 'react';
import { copiar } from '../utils/copy';
import { formatPlaca } from '../utils/formatPlaca';

interface Props {
  formData: any;
  extratorData: any;
}

const Monitoramento: React.FC<Props> = ({ formData, extratorData }) => {
  const agora = new Date();
  const inicio = new Date(agora.getTime() + 2 * 60 * 60 * 1000);
  const termino = new Date(inicio.getTime() + 2 * 24 * 60 * 60 * 1000);

  const formatarData = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

  const dados = [
    { label: 'Nome Motorista', valor: formData.nomeMotorista },
    { label: 'Placa Cavalo', valor: formatPlaca(formData.placaCavalo) },
    { label: 'Placa Reboque', valor: formatPlaca(formData.placaReboque) },
    { label: 'Horário Início', valor: formatarData(inicio) },
    { label: 'Horário Término', valor: formatarData(termino) },
    { label: 'Destino', valor: formData.linha },
    { label: 'Peso', valor: extratorData?.peso_liquido || '' },
    { label: 'Valor', valor: extratorData?.valor_nota || '' },
    { label: 'Série', valor: extratorData?.serie || '' },
    { label: 'Número', valor: extratorData?.numero_nota || '' },
    { label: 'Linha', valor: formData.linha },
  ];

  return (
    <div className="aba-monitoramento">
      <h3>Monitoramento</h3>
      <div className="grid-monitoramento">
        {dados.map((d, i) => (
          <div key={i} className="item">
            <span>{d.label}:</span>
            <button onClick={() => copiar(d.valor, d.label)} className="btn-copiar">
              {d.valor || '—'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Monitoramento;