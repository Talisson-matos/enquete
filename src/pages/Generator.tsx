// App.tsx (sem mudanças significativas, exceto import do utils/formatPlaca se necessário)
import React, { useState } from 'react';
import './Generator.css';
import ExtratorXML from '../components/ExtratorXML';
import Liberacao from '../components/Liberacao';
import Monitoramento from '../components/Monitoramento';
import SolicitacaoPedagio from '../components/SolicitacaoPedagio';

interface FormData {
  filial: string;
  cte: string;
  mdfe: string;
  nomeMotorista: string;
  placaCavalo: string;
  placaReboque: string;
  placaReboque2: string;
  linha: string;
  eixos: string;
  proprietarioANTT: string;
}

interface ExtratorData {
  cnpj_pagador_frete: string;
  cnpj_remetente: string;
  cnpj_destinatario: string;
  cnpj_terminal_coleta?: string;
  cnpj_terminal_entrega?: string;
  serie: string;
  numero_nota: string;
  chave_acesso: string;
  quantidade: string;
  peso_liquido: string;
  valor_nota: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extrator' | 'liberacao' | 'monitoramento' | 'pedagio'>('extrator');
  const [formData, setFormData] = useState<FormData>({
    filial: '',
    cte: '',
    mdfe: '',
    nomeMotorista: '',
    placaCavalo: '',
    placaReboque: '',
    placaReboque2: '',
    linha: '',
    eixos: '',
    proprietarioANTT: '',
  });
  const [extratorData, setExtratorData] = useState<ExtratorData | null>(null);
  const [pesoTipo, setPesoTipo] = useState<'liquido' | 'bruto'>('liquido');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const limparTudo = () => {
    setFormData({
      filial: '',
      cte: '',
      mdfe: '',
      nomeMotorista: '',
      placaCavalo: '',
      placaReboque: '',
      placaReboque2: '',
      linha: '',
      eixos: '',
      proprietarioANTT: '',
    });
    setExtratorData(null);
    setPesoTipo('liquido');
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Gerenciador de Transporte</h1>
      </header>

      {/* Formulário Primordial */}
      <section className="form-section">
        <h2 className="section-title">Dados do Transporte</h2>
        <div className="contant-form">
          <textarea id="textarea_compact"></textarea>

          <div className="form-grid">
            {[
              { label: 'Filial', name: 'filial' },
              { label: 'CTE', name: 'cte' },
              { label: 'MDFe', name: 'mdfe' },
              { label: 'Nome do Motorista', name: 'nomeMotorista' },
              { label: 'Placa Cavalo', name: 'placaCavalo' },
              { label: 'Placa Reboque', name: 'placaReboque' },
              { label: 'Placa Reboque 2', name: 'placaReboque2' },
              { label: 'Linha', name: 'linha' },
              { label: 'Eixos', name: 'eixos' },
              { label: 'Proprietário ANTT', name: 'proprietarioANTT' },
            ].map(field => (
              <div key={field.name} className="input-group">
                <label>{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={formData[field.name as keyof FormData]}
                  onChange={handleInputChange}
                  placeholder={field.label}
                />
              </div>
            ))}
          </div>

        </div>
        <button onClick={limparTudo} className="btn-clear">
          Limpar Tudo
        </button>
      </section>

      {/* Abas */}
      <div className="tabs-container">
        <div className="tabs">
          {[
            { id: 'extrator', label: 'Extrator de XML', icon: '📄' },
            { id: 'liberacao', label: 'Liberação', icon: '✅' },
            { id: 'monitoramento', label: 'Monitoramento', icon: '📡' },
            { id: 'pedagio', label: 'Solicitação de Pedágio', icon: '🛣️' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'extrator' && (
            <ExtratorXML
              setExtratorData={setExtratorData}
              pesoTipo={pesoTipo}
              setPesoTipo={setPesoTipo}
            />
          )}
          {activeTab === 'liberacao' && <Liberacao formData={formData} />}
          {activeTab === 'monitoramento' && <Monitoramento formData={formData} extratorData={extratorData} />}
          {activeTab === 'pedagio' && <SolicitacaoPedagio formData={formData} />}
        </div>
      </div>
    </div>
  );
};

export default App;