// components/ExtratorXML.tsx (mudado para single file, estilização melhorada via CSS separado)
import React, { useState } from 'react';
import './../styles/ExtratorXML.css';

interface Props {
  setExtratorData: (data: any) => void;
  pesoTipo: 'liquido' | 'bruto';
  setPesoTipo: (tipo: 'liquido' | 'bruto') => void;
}

const campoLabels: Record<string, string> = {
  cnpj_pagador_frete: 'CNPJ/CPF Pagador do Frete',
  cnpj_remetente: 'CNPJ/CPF Remetente',
  cnpj_destinatario: 'CNPJ/CPF Destinatário',
  cnpj_terminal_coleta: 'CNPJ/CPF Terminal de Coleta',
  cnpj_terminal_entrega: 'CNPJ/CPF Terminal de Entrega',
  serie: 'Série',
  numero_nota: 'Número da Nota',
  chave_acesso: 'Chave de Acesso',
  quantidade: 'Quantidade',
  peso_liquido: 'Peso Líquido',
  valor_nota: 'Valor da Nota',
};

const ExtratorXML: React.FC<Props> = ({ setExtratorData, pesoTipo, setPesoTipo }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dados, setDados] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && (selected.type === 'text/xml' || selected.name.endsWith('.xml'))) {
      setFile(selected);
    } else {
      alert('Selecione um arquivo XML válido.');
      e.target.value = '';
      setFile(null);
    }
  };

  const formatarNumero = (valor: string) => valor.replace('.', ',');

  const processarXML = async (file: File) => {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');

    const getCnpjOrCpf = (node: Element | null) => {
      const cpf = node?.querySelector('CPF')?.textContent;
      const cnpj = node?.querySelector('CNPJ')?.textContent;
      return cpf || cnpj || 'Não encontrado';
    };

    const emitNode = xmlDoc.querySelector('emit');
    const destNode = xmlDoc.querySelector('dest');
    const retiradaNode = xmlDoc.querySelector('retirada');
    const entregaNode = xmlDoc.querySelector('entrega');

    const cnpjRemetente = getCnpjOrCpf(emitNode);
    const cnpjDestinatario = getCnpjOrCpf(destNode);
    const cnpjColeta = getCnpjOrCpf(retiradaNode);
    const cnpjEntrega = getCnpjOrCpf(entregaNode);

    const modFrete = xmlDoc.querySelector('transp modFrete')?.textContent || '9';
    const pagadorFrete = ['0', '4'].includes(modFrete)
      ? cnpjRemetente
      : modFrete === '1'
      ? cnpjDestinatario
      : 'Não especificado';

    const qVol = xmlDoc.querySelector('transp vol qVol')?.textContent || 'Não encontrado';
    const pesoL = xmlDoc.querySelector('transp vol pesoL')?.textContent || '';
    const pesoB = xmlDoc.querySelector('transp vol pesoB')?.textContent || '';
    const peso = pesoTipo === 'liquido' ? (pesoL || pesoB) : (pesoB || pesoL);
    const vNF = xmlDoc.querySelector('ICMSTot vNF')?.textContent || 'Não encontrado';

    const dadosFinais = {
      cnpj_pagador_frete: pagadorFrete,
      cnpj_remetente: cnpjRemetente,
      cnpj_destinatario: cnpjDestinatario,
      ...(cnpjColeta !== 'Não encontrado' && { cnpj_terminal_coleta: cnpjColeta }),
      ...(cnpjEntrega !== 'Não encontrado' && { cnpj_terminal_entrega: cnpjEntrega }),
      serie: xmlDoc.querySelector('ide serie')?.textContent || 'Não encontrado',
      numero_nota: xmlDoc.querySelector('ide nNF')?.textContent || 'Não encontrado',
      chave_acesso: xmlDoc.querySelector('infNFe')?.getAttribute('Id')?.replace('NFe', '') || 'Não encontrado',
      quantidade: qVol !== 'Não encontrado' ? formatarNumero(qVol) : qVol,
      peso_liquido: peso !== '' ? formatarNumero(peso) : 'Não encontrado',
      valor_nota: vNF !== 'Não encontrado' ? formatarNumero(vNF) : vNF,
    };

    return dadosFinais;
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const dadosExtraidos = await processarXML(file);
      setDados(dadosExtraidos);
      setExtratorData(dadosExtraidos);
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o XML. Verifique o formato do arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const copiar = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = `${label} copiado!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  };

  return (
    <div className="extrator-xml">
      <div className="upload-area">
        <div className="file-wrapper">
          <input
            type="file"
            accept=".xml,text/xml"
            onChange={handleFileChange}
            id="xml-file"
            className="file-input"
          />
          <label htmlFor="xml-file" className="file-label">
            <span className="file-icon">📎</span>
            {file ? file.name : 'Selecionar XML'}
          </label>
        </div>

        <div className="peso-opcao">
          <label className="radio-label">
            <input
              type="radio"
              checked={pesoTipo === 'liquido'}
              onChange={() => setPesoTipo('liquido')}
            />
            Peso Líquido (Padrão)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              checked={pesoTipo === 'bruto'}
              onChange={() => setPesoTipo('bruto')}
            />
            Peso Bruto
          </label>
        </div>

        <button onClick={handleUpload} disabled={loading || !file} className="btn-extrair">
          {loading ? 'Processando...' : 'Extrair Dados'}
        </button>
      </div>

      {Object.keys(dados).length > 0 && (
        <div className="resultados">
          <h3 className="resultados-title">Dados Extraídos</h3>
          <div className="grid-dados">
            {Object.entries(dados).map(([key, val]) => {
              const label = campoLabels[key] || key;
              const valor = String(val);
              const noValue = valor === 'Não encontrado';
              return (
                <div key={key} className="item-dado">
                  <span className="item-label">{label}</span>
                  <button 
                    onClick={() => copiar(valor, label)} 
                    className={`btn-copiar ${noValue ? 'no-value' : ''}`}
                  >
                    {noValue ? 'Não encontrado' : valor} 📋
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!file && !Object.keys(dados).length && (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <p>Selecione um XML para extrair dados.</p>
        </div>
      )}
    </div>
  );
};

export default ExtratorXML;