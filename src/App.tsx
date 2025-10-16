// src/App.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

interface FormData {
  numeroPedido: string;
  motorista: string;
  cavalo: string;
  reboque: string;
  linha: string;
  proprietario: string;
  itemFrete: string;
  eixos: string;
  liberacao: string;
  freteSemImposto: string;
  freteComImposto: string;
  contaBancaria: string;
  freteTerceiroCheio: string;
  freteTerceiroTotal: string;
}

interface CapturedData {
  liberacaoInput?: string;
  sm?: string;
  cte?: string;
  filial?: string;
  mdfe?: string;
  valePedagio?: string;
  ctrb?: string;
  gnreDuplicata?: string;
}

const optionsList = [
  'LIBERAÇÃO',
  'SM',
  'REDUNDÂNCIA',
  'IMPORTAÇÃO',
  'CTE',
  'MDFE',
  'PEDÁGIO',
  'CTRB',
  'GUIA/DUPLICATA',
  'ADIANTAMENTO'
];

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    numeroPedido: '',
    motorista: '',
    cavalo: '',
    reboque: '',
    linha: '',
    proprietario: '',
    itemFrete: '',
    eixos: '',
    liberacao: '',
    freteSemImposto: '',
    freteComImposto: '',
    contaBancaria: '',
    freteTerceiroCheio: '',
    freteTerceiroTotal: '',
  });
  const [capturedData, setCapturedData] = useState<CapturedData>({});
  const [showEnquete, setShowEnquete] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [progressStates, setProgressStates] = useState<{ [key: string]: 'empty' | 'pending' | 'full' }>({});
  const [accordionStates, setAccordionStates] = useState<{ [key: string]: boolean }>({});
 

  const handleOptionChange = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptureChange = (key: keyof CapturedData, value: string) => {
    setCapturedData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setIsModalOpen(false);
    setShowEnquete(true);
    // Initialize progress states for selected enquetes
    const initialProgress: { [key: string]: 'empty' | 'pending' | 'full' } = {};
    selectedOptions.forEach((opt) => {
      initialProgress[opt] = 'empty';
    });
    // Add fixed enquetes from aba conferencia inicial, etc.
    initialProgress['Conferência placas/motorista/ordem de coleta'] = 'empty';
    initialProgress['Conferência notas/planilha'] = 'empty';
    initialProgress['Conferencia Mínimo ANTT Carga Geral'] = 'empty';
    initialProgress['Conferencia placas RNTRC/ Proprietario Cavalo'] = 'empty';
    initialProgress['PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA'] = 'empty';
    initialProgress['CONFERENCIA DE NOTAS'] = 'empty';
    initialProgress['CONFIRMAR CARREGAMENTO'] = 'empty';
    initialProgress['LIBERAR DOCUMENTAÇÕES'] = 'empty';
    setProgressStates(initialProgress);
  };

  const toggleProgress = (key: string) => {
    setProgressStates((prev) => {
      const current = prev[key];
      if (current === 'empty') return { ...prev, [key]: 'pending' };
      if (current === 'pending') return { ...prev, [key]: 'full' };
      return { ...prev, [key]: 'empty' };
    });
  };

  const toggleAccordion = (key: string) => {
    setAccordionStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const editOptions = () => {
    setIsModalOpen(true);
    setShowEnquete(false);
  };

 


  const createSummaryTxt = () => {
    const summary = `
Nº PEDIDO: ${formData.numeroPedido}
MOTORISTA: ${formData.motorista}
CAVALO: ${formData.cavalo}
REBOQUE: ${formData.reboque}
LINHA: ${formData.linha}
PROPRIETARIO(CNPJ / CPF): ${formData.proprietario}
ITEM FRETE: ${formData.itemFrete}
EIXOS: ${formData.eixos}
LIBERAÇÃO: ${formData.liberacao || capturedData.liberacaoInput || ''}
FRETE S/IMPOSTO: ${formData.freteSemImposto}
FRETE C/IMPOSTO: ${formData.freteComImposto}
CONTA BANCARIA: ${formData.contaBancaria}
FRETE TERCEIRO CHEIO: ${formData.freteTerceiroCheio}
FRETE TERCEIRO TOTAL: ${formData.freteTerceiroTotal}
SM: ${capturedData.sm || ''}
CTE: ${capturedData.cte || ''}
MDFE: ${capturedData.mdfe || ''}
VALE PEDAGIO: ${capturedData.valePedagio || ''}
CTRB: ${capturedData.ctrb || ''}
GUIA/DUPLICATA: ${capturedData.gnreDuplicata || ''}
    `;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resumo.txt';
    a.click();
  };

  const resetAll = () => {
    setSelectedOptions([]);
    setFormData({
      numeroPedido: '',
      motorista: '',
      cavalo: '',
      reboque: '',
      linha: '',
      proprietario: '',
      itemFrete: '',
      eixos: '',
      liberacao: '',
      freteSemImposto: '',
      freteComImposto: '',
      contaBancaria: '',
      freteTerceiroCheio: '',
      freteTerceiroTotal: '',
    });
    setCapturedData({});
    setShowEnquete(false);
    setIsModalOpen(true);
    setProgressStates({});
    setAccordionStates({});
  };

  const getTabs = () => {
    const tabs: { name: string; content: React.ReactElement }[] = [];

    // Aba Conferencia Inicial (sempre presente)
    tabs.push({
      name: 'CONFERÊNCIA INICIAL',
      content: (
        <div>
          <EnqueteItem
            label="Conferência placas/motorista/ordem de coleta"
            state={progressStates['Conferência placas/motorista/ordem de coleta']}
            onToggle={() => toggleProgress('Conferência placas/motorista/ordem de coleta')}
          />
          <Accordion
            title="Informações"
            isOpen={accordionStates['conf1'] || false}
            onToggle={() => toggleAccordion('conf1')}
          >
            MOTORISTA: {formData.motorista}<br />
            CAVALO: {formData.cavalo}<br />
            REBOQUE: {formData.reboque}
          </Accordion>

          <EnqueteItem
            label="Conferência notas/planilha"
            state={progressStates['Conferência notas/planilha']}
            onToggle={() => toggleProgress('Conferência notas/planilha')}
          />

          <EnqueteItem
            label="Conferencia Mínimo ANTT Carga Geral"
            state={progressStates['Conferencia Mínimo ANTT Carga Geral']}
            onToggle={() => toggleProgress('Conferencia Mínimo ANTT Carga Geral')}
          />
          <a href="https://qualp.com.br/#/" target="_blank" rel="noopener noreferrer">
            <button>Acessar QualP</button>
          </a>
          <Accordion
            title="Informações"
            isOpen={accordionStates['conf2'] || false}
            onToggle={() => toggleAccordion('conf2')}
          >
            LINHA: {formData.linha}<br />
            EIXOS: {formData.eixos}
          </Accordion>

          <EnqueteItem
            label="Conferencia placas RNTRC/ Proprietario Cavalo"
            state={progressStates['Conferencia placas RNTRC/ Proprietario Cavalo']}
            onToggle={() => toggleProgress('Conferencia placas RNTRC/ Proprietario Cavalo')}
          />
          <a href="https://consultapublica.antt.gov.br/Site/ConsultaRNTRC.aspx" target="_blank" rel="noopener noreferrer">
            <button>Acessar Consulta RNTRC</button>
          </a>
          <Accordion
            title="Informações"
            isOpen={accordionStates['conf3'] || false}
            onToggle={() => toggleAccordion('conf3')}
          >
            MOTORISTA: {formData.motorista}<br />
            PROPRIETARIO: {formData.proprietario}<br />
            CAVALO: {formData.cavalo}<br />
            REBOQUE: {formData.reboque}
          </Accordion>
        </div>
      ),
    });

    // Aba Liberação (se não preenchida no form)
    if (!formData.liberacao) {
      tabs.push({
        name: 'LIBERAÇÃO',
        content: (
          <div>
            <EnqueteItem
              label="LIBERAÇÃO"
              state={progressStates['LIBERAÇÃO']}
              onToggle={() => toggleProgress('LIBERAÇÃO')}
            />
            <input
              type="text"
              placeholder="LIBERAÇÃO"
              value={capturedData.liberacaoInput || ''}
              onChange={(e) => handleCaptureChange('liberacaoInput', e.target.value)}
            />
            <a href="http://vstrack.ddns.net/komando/" target="_blank" rel="noopener noreferrer">
              <button>Acessar Komando</button>
            </a>
            <Accordion
              title="Informações"
              isOpen={accordionStates['lib'] || false}
              onToggle={() => toggleAccordion('lib')}
            >
              MOTORISTA: {formData.motorista}<br />
              CAVALO: {formData.cavalo}<br />
              REBOQUE: {formData.reboque}<br />
              LINHA: {formData.linha}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba SM (se selecionada)
    if (selectedOptions.includes('SM')) {
      tabs.push({
        name: 'SM',
        content: (
          <div>
            <EnqueteItem
              label="SM"
              state={progressStates['SM']}
              onToggle={() => toggleProgress('SM')}
            />
            <input
              type="text"
              placeholder="SM"
              value={capturedData.sm || ''}
              onChange={(e) => handleCaptureChange('sm', e.target.value)}
            />
            <a href="http://vstrack.ddns.net/komando/" target="_blank" rel="noopener noreferrer">
              <button>Acessar Komando</button>
            </a>
            <Accordion
              title="Informações"
              isOpen={accordionStates['sm'] || false}
              onToggle={() => toggleAccordion('sm')}
            >
              MOTORISTA: {formData.motorista}<br />
              CAVALO: {formData.cavalo}<br />
              REBOQUE: {formData.reboque}<br />
              Horario +2 horas de inicio, 48h de termino<br />
              LINHA: {formData.linha}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba Redundância (se selecionada)
    if (selectedOptions.includes('REDUNDÂNCIA')) {
      tabs.push({
        name: 'REDUNDÂNCIA',
        content: (
          <div>
            <EnqueteItem
              label="REDUNDÂNCIA"
              state={progressStates['REDUNDÂNCIA']}
              onToggle={() => toggleProgress('REDUNDÂNCIA')}
            />
            <a href="http://vstrack.ddns.net/komando/" target="_blank" rel="noopener noreferrer">
              <button>Acessar Komando</button>
            </a>
            <Accordion
              title="Informações"
              isOpen={accordionStates['red'] || false}
              onToggle={() => toggleAccordion('red')}
            >
              MOTORISTA: {formData.motorista}<br />
              CAVALO: {formData.cavalo}<br />
              SM: {capturedData.sm || ''}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba Importação (se selecionada)
    if (selectedOptions.includes('IMPORTAÇÃO')) {
      tabs.push({
        name: 'IMPORTAÇÃO',
        content: (
          <div>
            <EnqueteItem
              label="IMPORTAÇÃO"
              state={progressStates['IMPORTAÇÃO']}
              onToggle={() => toggleProgress('IMPORTAÇÃO')}
            />
            <Accordion
              title="Informações"
              isOpen={accordionStates['imp'] || false}
              onToggle={() => toggleAccordion('imp')}
            >
              CAVALO: {formData.cavalo}<br />
              MOTORISTA: {formData.motorista}<br />
              LINHA: {formData.linha}<br />
              ITEM FRETE: {formData.itemFrete}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba CTE (se selecionada)
    if (selectedOptions.includes('CTE')) {
      tabs.push({
        name: 'CTE',
        content: (
          <div>
            <EnqueteItem
              label="CTE"
              state={progressStates['CTE']}
              onToggle={() => toggleProgress('CTE')}
            />
            <input
              type="text"
              placeholder="CTE"
              value={capturedData.cte || ''}
              onChange={(e) => handleCaptureChange('cte', e.target.value)}
            />
            <Accordion
              title="Informações"
              isOpen={accordionStates['cte'] || false}
              onToggle={() => toggleAccordion('cte')}
            >
              CAVALO: {formData.cavalo}<br />
              MOTORISTA: {formData.motorista}<br />
              REBOQUE: {formData.reboque}<br />
              LINHA: {formData.linha}<br />
              Nº PEDIDO: {formData.numeroPedido}<br />
              AO OCORRER SINISTRO LIGUE PARA A SEGURADORA 0800 1234 2016<br />
              FRETE S/IMPOSTO: {formData.freteSemImposto}<br />
              FRETE C/IMPOSTO: {formData.freteComImposto}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba MDFE (se selecionada)
    if (selectedOptions.includes('MDFE')) {
      tabs.push({
        name: 'MDFE',
        content: (
          <div>
            <EnqueteItem
              label="MDFE"
              state={progressStates['MDFE']}
              onToggle={() => toggleProgress('MDFE')}
            />
            <input
              type="text"
              placeholder="FILIAL"
              value={capturedData.filial || ''}
              onChange={(e) => handleCaptureChange('filial', e.target.value)}
            />
            <input
              type="text"
              placeholder="Nº MDFE"
              value={capturedData.mdfe || ''}
              onChange={(e) => handleCaptureChange('mdfe', e.target.value)}
            />
            <Accordion
              title="Lembretes"
              isOpen={accordionStates['mdfe'] || false}
              onToggle={() => toggleAccordion('mdfe')}
            >
              - Selecionar Lotação<br />
              - Selecionar checked, caso tenha pedágio
            </Accordion>
          </div>
        ),
      });
    }

    // Aba Pedágio (se selecionada)
    if (selectedOptions.includes('PEDÁGIO')) {
      tabs.push({
        name: 'PEDÁGIO',
        content: (
          <div>
            <EnqueteItem
              label="PEDÁGIO"
              state={progressStates['PEDÁGIO']}
              onToggle={() => toggleProgress('PEDÁGIO')}
            />
            <input
              type="text"
              placeholder="VALE PEDAGIO"
              value={capturedData.valePedagio || ''}
              onChange={(e) => handleCaptureChange('valePedagio', e.target.value)}
            />
            <a href="https://www.roadcard.com.br/sistemapamcard/?loadGaScript=load" target="_blank" rel="noopener noreferrer">
              <button>Acessar RoadCard</button>
            </a>
            <Accordion
              title="Informações"
              isOpen={accordionStates['ped'] || false}
              onToggle={() => toggleAccordion('ped')}
            >
              FILIAL: {capturedData.filial || ''}<br />
              MDFE: {capturedData.mdfe || ''}<br />
              MOTORISTA: {formData.motorista}<br />
              PLACAS: {formData.cavalo}<br />
              EIXOS: {formData.eixos}<br />
              LINHA: {formData.linha}<br />
              CARTÃO: VAZIO<br />
              VALOR: VAZIO<br />
              FATURADO: SAMID<br />
              CPF/CNPJ PROPRIETÁRIO ANTT: {formData.proprietario}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba CTRB (se selecionada)
    if (selectedOptions.includes('CTRB')) {
      tabs.push({
        name: 'CTRB',
        content: (
          <div>
            <EnqueteItem
              label="CTRB - CONTRATO DE FRETE"
              state={progressStates['CTRB']}
              onToggle={() => toggleProgress('CTRB')}
            />
            <input
              type="text"
              placeholder="CTRB"
              value={capturedData.ctrb || ''}
              onChange={(e) => handleCaptureChange('ctrb', e.target.value)}
            />
            <Accordion
              title="Informações"
              isOpen={accordionStates['ctrb'] || false}
              onToggle={() => toggleAccordion('ctrb')}
            >
              LIBERAÇÃO: {formData.liberacao || capturedData.liberacaoInput || ''}<br />
              CONTA BANCARIA: {formData.contaBancaria}<br />
              FRETE TERCEIRO CHEIO: {formData.freteTerceiroCheio}<br />
              FRETE TERCEIRO TOTAL: {formData.freteTerceiroTotal}
            </Accordion>
          </div>
        ),
      });
    }

    // Aba Guia/Duplicata (se selecionada)
    if (selectedOptions.includes('GUIA/DUPLICATA')) {
      tabs.push({
        name: 'GUIA/DUPLICATA',
        content: (
          <div>
            <EnqueteItem
              label="GNRE - GUIA DE ICMS"
              state={progressStates['GNRE - GUIA DE ICMS']}
              onToggle={() => toggleProgress('GNRE - GUIA DE ICMS')}
            />
            <input
              type="text"
              placeholder="GNRE/DUPLICATA"
              value={capturedData.gnreDuplicata || ''}
              onChange={(e) => handleCaptureChange('gnreDuplicata', e.target.value)}
            />
            <EnqueteItem
              label="DUPLICATA"
              state={progressStates['DUPLICATA']}
              onToggle={() => toggleProgress('DUPLICATA')}
            />
            <a href="https://agile-trucker.vercel.app/" target="_blank" rel="noopener noreferrer">
              <button>Acessar Agile Trucker</button>
            </a>
            <a href="https://www.gnre.pe.gov.br:444/gnre/v/guia/index" target="_blank" rel="noopener noreferrer">
              <button>Acessar GNRE</button>
            </a>
          </div>
        ),
      });
    }

    // Planilha Padrão
    tabs.push({
      name: 'PLANILHA PADRÃO',
      content: (
        <div>
          <EnqueteItem
            label="PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA"
            state={progressStates['PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA']}
            onToggle={() => toggleProgress('PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA')}
          />
        </div>
      ),
    });

    // Aba Adiantamento (se selecionada)
    if (selectedOptions.includes('ADIANTAMENTO')) {
      tabs.push({
        name: 'ADIANTAMENTO',
        content: (
          <div>
            <EnqueteItem
              label="ADIANTAMENTO"
              state={progressStates['ADIANTAMENTO']}
              onToggle={() => toggleProgress('ADIANTAMENTO')}
            />
            <Accordion
              title="Informações"
              isOpen={accordionStates['adi'] || false}
              onToggle={() => toggleAccordion('adi')}
            >
              ADIANTAMENTO CTE LIBERADO | OPERAÇÃO ** | STATUS:<br />
              ADIANTAMENTO LIBERADO.<br />
              PAGAMENTO PENDENTE.<br />
              PLANILHA ATUALIZADA.
            </Accordion>
          </div>
        ),
      });
    }

    // Carregamento e Conferencia de Notas
    tabs.push({
      name: 'CARREGAMENTO E CONFERÊNCIA DE NOTAS',
      content: (
        <div>
          <EnqueteItem
            label="CONFERÊNCIA DE NOTAS"
            state={progressStates['CONFERÊNCIA DE NOTAS']}
            onToggle={() => toggleProgress('CONFERÊNCIA DE NOTAS')}
          />
          <Accordion
            title="Informações"
            isOpen={accordionStates['confnotas'] || false}
            onToggle={() => toggleAccordion('confnotas')}
          >
            CONFERÊNCIA COM O NÚMERO DAS NOTAS DO MOTORISTA E DO CTE
          </Accordion>
          <EnqueteItem
            label="CONFIRMAR CARREGAMENTO"
            state={progressStates['CONFIRMAR CARREGAMENTO']}
            onToggle={() => toggleProgress('CONFIRMAR CARREGAMENTO')}
          />
          <EnqueteItem
            label="LIBERAR DOCUMENTAÇÕES"
            state={progressStates['LIBERAR DOCUMENTAÇÕES']}
            onToggle={() => toggleProgress('LIBERAR DOCUMENTAÇÕES')}
          />
        </div>
      ),
    });

    return tabs;
  };

  const tabs = getTabs();

  return (
    <div className="app">
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Selecione as Opções</h2>
            {optionsList.map((option) => (
              <label key={option}>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleOptionChange(option)}
                />
                {option}
              </label>
            ))}
            <h3>Formulário</h3>
            <input name="numeroPedido" placeholder="Nº PEDIDO" value={formData.numeroPedido} onChange={handleFormChange} />
            <input name="motorista" placeholder="MOTORISTA" value={formData.motorista} onChange={handleFormChange} />
            <input name="cavalo" placeholder="CAVALO" value={formData.cavalo} onChange={handleFormChange} />
            <input name="reboque" placeholder="REBOQUE" value={formData.reboque} onChange={handleFormChange} />
            <input name="linha" placeholder="LINHA" value={formData.linha} onChange={handleFormChange} />
            <input name="proprietario" placeholder="PROPRIETARIO(CNPJ / CPF)" value={formData.proprietario} onChange={handleFormChange} />
            <input name="itemFrete" placeholder="ITEM FRETE" value={formData.itemFrete} onChange={handleFormChange} />
            <input name="eixos" placeholder="EIXOS" value={formData.eixos} onChange={handleFormChange} />
            <input name="liberacao" placeholder="LIBERAÇÃO" value={formData.liberacao} onChange={handleFormChange} />
            <input name="freteSemImposto" placeholder="FRETE S/IMPOSTO" value={formData.freteSemImposto} onChange={handleFormChange} />
            <input name="freteComImposto" placeholder="FRETE C/IMPOSTO" value={formData.freteComImposto} onChange={handleFormChange} />
            <input name="contaBancaria" placeholder="CONTA BANCARIA" value={formData.contaBancaria} onChange={handleFormChange} />
            <input name="freteTerceiroCheio" placeholder="FRETE TERCEIRO CHEIO" value={formData.freteTerceiroCheio} onChange={handleFormChange} />
            <input name="freteTerceiroTotal" placeholder="FRETE TERCEIRO TOTAL" value={formData.freteTerceiroTotal} onChange={handleFormChange} />
            <button onClick={handleSubmit}>Gerar Enquete</button>
          </motion.div>
        )}
      </AnimatePresence>

      {showEnquete && (
        <div>
          <button onClick={editOptions}>Editar Opções</button>
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={activeTab === tab.name ? 'active' : ''}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {tabs.find((tab) => tab.name === activeTab)?.content}
          </div>
          <div className="final-options">            
            <button onClick={createSummaryTxt}>CRIAR RESUMO</button>
            <button onClick={resetAll}>APAGAR TUDO</button>
          </div>
        </div>
      )}
    </div>
  );
};

interface EnqueteItemProps {
  label: string;
  state: 'empty' | 'pending' | 'full';
  onToggle: () => void;
}

const EnqueteItem: React.FC<EnqueteItemProps> = ({ label, state, onToggle }) => {
  const getColor = () => {
    if (state === 'full') return 'darkgreen';
    if (state === 'pending') return 'orange';
    return 'lightgray';
  };

  const getWidth = () => {
    if (state === 'full') return '100%';
    if (state === 'pending') return '50%';
    return '0%';
  };

  const getButtonText = () => {
    if (state === 'full') return '✔️';
    if (state === 'pending') return '⚠️'; 
    return '✏️';
  };

  return (
    <div className={`enquete-item ${state === 'pending' ? 'pending-highlight' : ''}`}>
      <span>{label}</span>
      <motion.div
        className="progress-bar"
        initial={{ width: '0%' }}
        animate={{ width: getWidth(), backgroundColor: getColor() }}
        transition={{ duration: 0.5 }}
      />
      <button onClick={onToggle}>{getButtonText()}</button>
    </div>
  );
};

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="accordion">
      <button onClick={onToggle}>{title} {isOpen ? '-' : '+'}</button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;