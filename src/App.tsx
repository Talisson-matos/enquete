// App.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { Link } from 'react-router-dom';

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

const operacoes = [
  { value: 'garrafa', label: 'Garrafa' },
  { value: 'unidocs', label: 'Unidocs' },
  { value: 'heineken', label: 'Heineken' },
  { value: 'siderurgica', label: 'Siderúrgica' },
  { value: 'cafe', label: 'Café' },
  { value: 'fertilizantes', label: 'Fertilizantes' },
  { value: 'nestle', label: 'Nestlé' },
];

const tipoMotoristaOptions = [
  { value: 'frota', label: 'Motorista Frota' },
  { value: 'terceiro', label: 'Motorista Terceiro' },
];

const opcoesPorOperacao = {
  garrafa: {
    frota: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'GUIA/DUPLICATA'],
    terceiro: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'GUIA/DUPLICATA', 'CTRB', 'LIBERAÇÃO', 'ADIANTAMENTO'],
  },
  unidocs: {
    frota: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'SM'],
    terceiro: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'CTRB', 'LIBERAÇÃO', 'PEDÁGIO', 'SM', 'ADIANTAMENTO'],
  },
  heineken: {
    frota: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'SM'],
    terceiro: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'CTRB', 'LIBERAÇÃO', 'PEDÁGIO', 'SM', 'ADIANTAMENTO'],
  },
  siderurgica: {
    frota: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'SM'],
    terceiro: ['CTE', 'MDFE', 'IMPORTAÇÃO', 'CTRB', 'LIBERAÇÃO', 'PEDÁGIO', 'SM', 'ADIANTAMENTO'],
  },
  cafe: {
    frota: ['CTE', 'MDFE', 'REDUNDÂNCIA', 'SM'],
    terceiro: ['CTE', 'MDFE', 'CTRB', 'REDUNDÂNCIA', 'LIBERAÇÃO', 'PEDÁGIO', 'SM', 'ADIANTAMENTO'],
  },
  fertilizantes: {
    frota: ['CTE', 'MDFE'],
    terceiro: ['CTE', 'MDFE', 'CTRB', 'LIBERAÇÃO', 'PEDÁGIO', 'ADIANTAMENTO'],
  },
  nestle: {
    frota: ['CTE', 'MDFE', 'SM'],
    terceiro: ['CTE', 'MDFE', 'CTRB', 'LIBERAÇÃO', 'SM', 'ADIANTAMENTO'],
  },
};

const App: React.FC = () => {
  const [showInitialScreen, setShowInitialScreen] = useState(true);
  const [selectedOperacao, setSelectedOperacao] = useState('');
  const [selectedTipoMotorista, setSelectedTipoMotorista] = useState('');
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
  const [valorFrete, setValorFrete] = useState('');
  const [aliquota, setAliquota] = useState('');
  const [creditoSelecionado, setCreditoSelecionado] = useState('');

  const handleIniciar = () => {
    if (!selectedOperacao || !selectedTipoMotorista) {
      alert('Selecione a operação e o tipo de motorista.');
      return;
    }

    const opcoes = opcoesPorOperacao[selectedOperacao as keyof typeof opcoesPorOperacao][selectedTipoMotorista as 'frota' | 'terceiro'];
    setSelectedOptions(opcoes);
    setShowInitialScreen(false);
    setShowEnquete(true);

    const initialProgress: { [key: string]: 'empty' | 'pending' | 'full' } = {};
    opcoes.forEach((opt) => {
      initialProgress[opt] = 'empty';
    });
    initialProgress['Conferência placas/motorista/ordem de coleta'] = 'empty';
    initialProgress['Conferência notas/planilha'] = 'empty';
    initialProgress['Conferencia Mínimo ANTT Carga Geral'] = 'empty';
    initialProgress['Conferencia placas RNTRC/ Proprietario Cavalo'] = 'empty';
    initialProgress['PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA'] = 'empty';
    initialProgress['CONFERÊNCIA DE NOTAS'] = 'empty';
    initialProgress['CONFIRMAR CARREGAMENTO'] = 'empty';
    initialProgress['LIBERAR DOCUMENTAÇÕES'] = 'empty';
    setProgressStates(initialProgress);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'motorista' ? value.toUpperCase() : value });
  };

  const handleCaptureChange = (key: keyof CapturedData, value: string) => {
    setCapturedData((prev) => ({ ...prev, [key]: value }));
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
    `.trim();
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumo_${formData.numeroPedido || 'pedido'}.txt`;
    a.click();
  };

  const resetAll = () => {
    setShowInitialScreen(true);
    setSelectedOperacao('');
    setSelectedTipoMotorista('');
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
    setActiveTab(null);
    setProgressStates({});
    setAccordionStates({});
  };

  const getTabStatus = (tabName: string) => {
    if (tabName === 'CONFERÊNCIA INICIAL') {
      const tasks = [
        'Conferência placas/motorista/ordem de coleta',
        'Conferência notas/planilha',
        'Conferencia Mínimo ANTT Carga Geral',
        'Conferencia placas RNTRC/ Proprietario Cavalo'
      ];
      const allFull = tasks.every((task) => progressStates[task] === 'full');
      const anyPending = tasks.some((task) => progressStates[task] === 'pending');
      return allFull ? 'full' : anyPending ? 'pending' : 'empty';
    } else if (tabName === 'CARREGAMENTO E CONFERÊNCIA DE NOTAS') {
      const tasks = ['CONFERÊNCIA DE NOTAS', 'CONFIRMAR CARREGAMENTO', 'LIBERAR DOCUMENTAÇÕES'];
      const allFull = tasks.every((task) => progressStates[task] === 'full');
      const anyPending = tasks.some((task) => progressStates[task] === 'pending');
      return allFull ? 'full' : anyPending ? 'pending' : 'empty';
    } else if (tabName === 'PLANILHA PADRÃO') {
      return progressStates['PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA'] || 'empty';
    } else if (tabName === 'GUIA/DUPLICATA') {
      const tasks = ['GNRE - GUIA DE ICMS', 'DUPLICATA'];
      const allFull = tasks.every((task) => progressStates[task] === 'full');
      const anyPending = tasks.some((task) => progressStates[task] === 'pending');
      return allFull ? 'full' : anyPending ? 'pending' : 'empty';
    } else {
      return progressStates[tabName] || 'empty';
    }
  };

  const getTabs = () => {
    const tabs: { name: string; content: React.ReactElement; index: number }[] = [];
    let tabIndex = 1;

    tabs.push({
      name: 'CONFERÊNCIA INICIAL',
      index: tabIndex++,
      content: (
        <div>
          <EnqueteItem label="Conferência placas/motorista/ordem de coleta" state={progressStates['Conferência placas/motorista/ordem de coleta']} onToggle={() => toggleProgress('Conferência placas/motorista/ordem de coleta')} />
          <Accordion title="Informações" isOpen={accordionStates['conf1'] || false} onToggle={() => toggleAccordion('conf1')}>
            MOTORISTA: {formData.motorista}<br />
            CAVALO: {formData.cavalo}<br />
            REBOQUE: {formData.reboque}
            <div className=""><br />


            </div>
          </Accordion>
          <EnqueteItem label="Conferência notas/planilha" state={progressStates['Conferência notas/planilha']} onToggle={() => toggleProgress('Conferência notas/planilha')} />
          <EnqueteItem label="Conferencia Mínimo ANTT Carga Geral" state={progressStates['Conferencia Mínimo ANTT Carga Geral']} onToggle={() => toggleProgress('Conferencia Mínimo ANTT Carga Geral')} />
          <a href="https://qualp.com.br/#/" target="_blank" rel="noopener noreferrer"><button>Acessar QualP</button></a>
          <Accordion title="Informações" isOpen={accordionStates['conf2'] || false} onToggle={() => toggleAccordion('conf2')}>
            LINHA: {formData.linha}<br />
            EIXOS: {formData.eixos}
          </Accordion>
          <EnqueteItem label="Conferencia placas RNTRC/ Proprietario Cavalo" state={progressStates['Conferencia placas RNTRC/ Proprietario Cavalo']} onToggle={() => toggleProgress('Conferencia placas RNTRC/ Proprietario Cavalo')} />
          <a href="https://consultapublica.antt.gov.br/Site/ConsultaRNTRC.aspx" target="_blank" rel="noopener noreferrer"><button>Acessar Consulta RNTRC</button></a>
          <Accordion title="Informações" isOpen={accordionStates['conf3'] || false} onToggle={() => toggleAccordion('conf3')}>
            MOTORISTA: {formData.motorista}<br />
            PROPRIETARIO: {formData.proprietario}<br />
            CAVALO: {formData.cavalo}<br />
            REBOQUE: {formData.reboque}
          </Accordion>
        </div>
      ),
    });

    if (selectedOptions.includes('LIBERAÇÃO') && !formData.liberacao) {
      tabs.push({
        name: 'LIBERAÇÃO',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="LIBERAÇÃO" state={progressStates['LIBERAÇÃO']} onToggle={() => toggleProgress('LIBERAÇÃO')} />
            <input type="text" placeholder="LIBERAÇÃO" value={capturedData.liberacaoInput || ''} onChange={(e) => handleCaptureChange('liberacaoInput', e.target.value)} />
            <a href="http://vstrack.ddns.net/komando/" target="_blank" rel="noopener noreferrer"><button>Acessar Komando</button></a>
            <Accordion title="Informações" isOpen={accordionStates['lib'] || false} onToggle={() => toggleAccordion('lib')}>
              MOTORISTA: {formData.motorista}<br />
              CAVALO: {formData.cavalo}<br />
              REBOQUE: {formData.reboque}<br />
              LINHA: {formData.linha}
            </Accordion>
          </div>
        ),
      });
    }

    if (selectedOptions.includes('SM')) {
      tabs.push({
        name: 'SM',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="SM" state={progressStates['SM']} onToggle={() => toggleProgress('SM')} />
            <input type="text" placeholder="SM" value={capturedData.sm || ''} onChange={(e) => handleCaptureChange('sm', e.target.value)} />
            <a href="http://vstrack.ddns.net/komando/" target="_blank" rel="noopener noreferrer"><button>Acessar Komando</button></a>
            <Accordion title="Informações" isOpen={accordionStates['sm'] || false} onToggle={() => toggleAccordion('sm')}>
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

    if (selectedOptions.includes('REDUNDÂNCIA')) {
      tabs.push({
        name: 'REDUNDÂNCIA',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="REDUNDÂNCIA" state={progressStates['REDUNDÂNCIA']} onToggle={() => toggleProgress('REDUNDÂNCIA')} />
            <a href="http://vstrack.ddns.net/komando/" target="_blank" rel="noopener noreferrer"><button>Acessar Komando</button></a>
            <Accordion title="Informações" isOpen={accordionStates['red'] || false} onToggle={() => toggleAccordion('red')}>
              MOTORISTA: {formData.motorista}<br />
              CAVALO: {formData.cavalo}<br />
              SM: {capturedData.sm || ''}
            </Accordion>
            <div style={{ color: "white" }}>

            </div>
          </div>

        ),
      });
    }

    if (selectedOptions.includes('IMPORTAÇÃO')) {
      tabs.push({
        name: 'IMPORTAÇÃO',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="IMPORTAÇÃO" state={progressStates['IMPORTAÇÃO']} onToggle={() => toggleProgress('IMPORTAÇÃO')} />
            <Accordion title="Informações" isOpen={accordionStates['imp'] || false} onToggle={() => toggleAccordion('imp')}>
              CAVALO: {formData.cavalo}<br />
              MOTORISTA: {formData.motorista}<br />
              LINHA: {formData.linha}<br />
              ITEM FRETE: {formData.itemFrete}
            </Accordion>
            <div style={{ color: "white" }}>

              IMPORTAÇÃO XML <br /><br />

              1)

              - IMPORTAR PACOTE XML/PDF NO PORTAL UNIDOCS PARA DIRETORIO DO COMPUTADOR;<br />
              ► https://unidocs.ambev.com.br/#/login - USUARIO: operacao.sp@samidtransportes.com.br SENHA: samidDFL@@1<br />
              ►  ABA LATERAL "DOCUMENTOS" ►  "CONSULTA CT-e" ►  CLICAR BOTAO LUPA AZUL, CANTO DIREITO DA TELA , PARA ATUALIZAR<br />
              ►  ABAIXO DO ROTULO "EMBARCADOR", MARCAR OS DOIS CHECKEDS CORRESPONDENTES AO CTE QUE SERÁ IMPORTADO<br />
              ►  CLICAR NO BOTAO 'DOWLOAD XML/DACTE', PARA REALIZAR A IMPORTAÇÃO <br /><br />

              - POSICIONAR O ARQUIVO XML NA PASTA XML UNIDOCS (PARA IMPORTAÇÃO)<br />
              - CONFERIR SE VALOR DO FRETE SAMID NA PLANILHA CONFERE COM O VALOR DO FRETE QUE ESTA NO CTE UNIDOCS E CONFERIR FRETE TERCEIRO(CASO HOUVER);<br />
              - CONFERIR SE AS ROTAS COINCIDEM;<br />
              - CONFERIR O ENGATE ►  MOTORISTA, CAVALO, REBOQUE <br /><br />

              2) IMPORTAR XML;<br />

              - CAMINHO: MATERIAIS ►  ROTINAS DE APOIO ►  IMPORTA XML NFE<br />
              - CLICAR NO DISKET ... ;PARA PROCURAR O ARQUIVO XML NA PASTA XML UNIDOCS;<br />
              - COM O ARQUIVO XML EXPOSTO, SELECIONÁ-LO PARA QUE FIQUE COM A COR DESTACADA;<br />
              - NA SUB-ABA PARAMETROS ADICIONAIS, MARCAR O CHECKED "USAR LINHA COM BASE NO CODIGO IBGE?"<br />
              - RETORNANDO A SUB-ABA IMPORTAÇÃO, NO CAMPO TIPO IMPORTAÇÃO, SELECIONAR "CTRC - EMISSÃO PRÓPRIA",<br />
              - EM "INFORMAÇÕES DO CONHECIMENTO", PREENCHER:<br /><br />

              ►  FROTA/PLACA: (PLACA CAVALO-MECÂNICO);<br />
              ►  MOTORISTA: <br />
              ►  SEGURO: 1(PADRÃO) OU 3(SE HOUVER SUBCONTRATAÇÃO);<br />
              ►  PRODUTO: 1270 (PRODUTO ACABADO) OU 1255(GARRAFA DE INSUMO), OUTRO PRODUTO CONFORME O TIPO DE CARGA TRANSPORTADA;<br />
              ►  TABELA DE FRETE C/ICMS: 256(AMBEV) OU 506(HEINEKEN) OU 522(ARCELOMITTAL)<br />
              ►  TABELA DE FRETE C/ICMS: 256(AMBEV) OU 506(HEINEKEN) OU 522(ARCELOMITTAL)<br />
              ►  LINHA: LINHA DE EMBARQUE DO CTE; LOCAL DE ORIGEM X DESTINO<br />
              ►  REGIÃO: 1(PADRÃO) - TERRITORIO NACIONAL<br />
              ►  ITEM TARIFA: NA ABA PRINCIPAL DO RODOPAR: FATURAMENTO ►  CADASTROS ►  TABELAS DE FRETE ►  TABELAS ►  EM "CODIGO FRETE"<br />
              PREENCHER 256(AMBEV) ►  NA SUB-ABA "TARIFA" CLICAR NO DISKETI DO BINÓCULOS, EM DESCRIÇÃO PREENCHER A ROTA DO CTE, E ATUALIZAR <br />
              COM F4, OU ALT + A; NOS VALORES APRESENTADOS PROCURAR PELO NUMERO DA COLUNA ITEM TARIFA;<br />
              ►  COD. FILIAL: 3 (SE FOR ANBEV MINAS) OU 21(SE FOR AMBEV RIO DE JANEIRO);<br /><br />

              - CONFERIR SE TODOS OS VALORES DOS CAMPOS ESTÃO CORRETOS,SE O COLCHETE DA SUB-ABA PARAMETROS ADICIONAIS ESTÁ MARCADO, E O ARQUIVO
              XML EXPOSTO ESTÁ SELECIONADO(COR DESTACADA);<br /><br />

              !!! ATENÇÃO: TODOS OS VALORES DEVEM ESTAR PREENCHIDOS CORRETAMENTE, O SISTEMA PERMITE APENAS UMA IMPORTAÇÃO DE XML POR ARQUIVO,
              CASO HOUVER ERRO PODE TER COMO CONSEQUENCIA CANCELAMENTO DE CTE;<br /><br />

              - CLICAR NO BOTAO PROCESSAR; ESPERAR ATÉ O RETORNO DO LOG "FIM DA IMPORTAÇÃO";``

            </div>
          </div>
        ),
      });
    }

    if (selectedOptions.includes('CTE')) {


      const creditosPresumidos = [
        'ESTADO DO ES - CREDITO PRESUMIDO - INCISO 37 DO ARTIGO 107 DO RICMS/ES',
        'ESTADO DO SP - CRÉDITO PRESUMIDO CONFORME §3º DO ARTIGO 11 DO ANEXO III DO RICMS-SP',
        'ESTADO DO SE - CRÉDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO INCISO IV, DO ART. 57 DO RICMS-SE',
        'ESTADO DO MA - CRÉDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO INCISO IX, DO ART. 1 DO ANEXO 1.5 DO ANEXO 1.0 DO RICMS-MA',
        'ESTADO DO CE - CRÉDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO DECRETO N° 24.333/97, E NO INCISO V DO ART. 64 DO DECRETO N° 24.569, DE 31 DE JULHO DE 1997',
        'ESTADO DO BA - CRÉDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO A ALÍNEA "B" DO INCISO III DO ART. 270 DO RICMS/BA',
        'ESTADO DO RJ - CRÉDITO PRESUMIDO CONF. DECRETO N° 27815 DE 24/01/2001 COMBINADO AO CONVENIO ICMS 106/96',
        'ESTADO DO PE - CRÉDITO PRESUMIDO - TRANSPORTADOR NÃO OBRIGADO A INSCRIÇÃO DENTRO DO ESTADO DO PE CONF. ALÍNEA "E" DO INC XI DO ART. 35 DO DECRETO 14.876/91',
        'ESTADO DO SC - CRÉDITO PRESUMIDO - PRESTADOR DE SERVIÇO DE TRANSPORTE NÃO OBRIGADOS À INSCRIÇÃO NO CCICMS - CONF. § 3º, ART. 25 DO ANEXO II DO RICMS/SC',
        'ESTADO DO PI - CRÉDITO PRESUMIDO - PRESTADOR NÃO OBRIGADO À INSCRIÇÃO NESTA UF, CONF. ALINEA C, INC. III, ART. 56 DO RICMS/PI',
        'ESTADO DO GO - CRÉDITO PRESUMIDO - INCISO II, §1º, DO ARTIGO 64 DO RCTE-GO',
        'ESTADO DO ES - CREDITO PRESUMIDO - INCISO 37 DO ARTIGO 107 DO RICMS/ES',
        'ESTADO DE MG - CRÉDITO PRESUMIDO REF-EMBASAMENTO LEGAL ART 107 INCISO 37 CONVENIO 106/96',
        'ESTADO DO PA - CRÉDITO PRESUMIDO CONF. CONVÊNIO ICMS 106/96 COMBINADO AO § 3º PELO CONV. ICMS 85/03',
        'ESTADO DO DF - ANEXO I AO DECRETO Nº 18.955, DE 22 DE DEZEMBRO DE 1997 - CADERNO III',
        'ESTADO DO RN - BASE DE CÁLCULO DO ICMS REDUZIDA, CONFORME ART. 87, INCISO XX-B, DO RICMS',
        'ESTADO DO PR - CONVÊNIO ICMS 85/2003 ART 3.2 DO REGULAMENTO DA PARANÁ',
      ];

      const calcularICMS = () => {
        const frete = parseFloat(valorFrete.replace(/\D/g, '')) / 100 || 0;
        const aliq = parseFloat(aliquota) || 0;
        const icms = frete * (aliq / 100);
        const credito = icms * 0.20; // 20% de crédito presumido
        const aRecolher = icms - credito;

        return {
          frete: frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          icms: icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          credito: credito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          aRecolher: aRecolher.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        };
      };

      const gerarTextoCTE = () => {
        const calc = calcularICMS();
        const cteNum = capturedData.cte || 'NÃO INFORMADO';
        const textoLegal = creditoSelecionado || 'NÃO SELECIONADO';

        return `- nº ${cteNum}
- AO OCORRER SINISTRO LIGUE PARA A CENTRAL DO SEGURO ATRAVÉS DO TELEFONE 0800 772 2016
- ${textoLegal}
- VALOR PRESTAÇÃO: ${calc.frete} - VALOR ICMS(${aliquota}%): ${calc.icms}
- CREDITO PRESUMIDO: ${calc.credito} - ICMS A RECOLHER: ${calc.aRecolher}`;
      };

      tabs.push({
        name: 'CTE',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="CTE" state={progressStates['CTE']} onToggle={() => toggleProgress('CTE')} />

            <input
              type="text"
              placeholder="Nº CTE"
              value={capturedData.cte || ''}
              onChange={(e) => handleCaptureChange('cte', e.target.value)}
              style={{ marginBottom: '1rem' }}
            />

            <div className="cte-calculo-grid">
              <input
                type="text"
                placeholder="VALOR DO FRETE (R$)"
                value={valorFrete}
                onChange={(e) => setValorFrete(e.target.value)}
              />
              <input
                type="text"
                placeholder="ALÍQUOTA (%)"
                value={aliquota}
                onChange={(e) => setAliquota(e.target.value)}
              />
            </div>

            <select
              value={creditoSelecionado}
              onChange={(e) => setCreditoSelecionado(e.target.value)}
              className="cte-select"
            >
              <option value="">Selecione o Crédito Presumido</option>
              {creditosPresumidos.map((opcao, i) => (
                <option key={i} value={opcao}>{opcao}</option>
              ))}
            </select>

            {capturedData.cte && valorFrete && aliquota && creditoSelecionado && (
              <div className="copy-section cte-copy">
                <pre className="cte-texto">{gerarTextoCTE()}</pre>
                <button onClick={() => copyToClipboard(gerarTextoCTE())}>
                  Copiar Texto Completo
                </button>
              </div>
            )}

            <Accordion title="Informações" isOpen={accordionStates['cte'] || false} onToggle={() => toggleAccordion('cte')}>
              CAVALO: {formData.cavalo}<br />
              MOTORISTA: {formData.motorista}<br />
              REBOQUE: {formData.reboque}<br />
              LINHA: {formData.linha}<br />
              Nº PEDIDO: {formData.numeroPedido}<br />
              AO OCORRER UM SINISTRO LIGUE PARA CENTRAL DO SEGURO ATRAVES DO TELEFONE 0800 772 2016<br />
              FRETE S/IMPOSTO: {formData.freteSemImposto}<br />
              FRETE C/IMPOSTO: {formData.freteComImposto}
            </Accordion>
          </div>
        ),
      });
    }
    if (selectedOptions.includes('MDFE')) {
      tabs.push({
        name: 'MDFE',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="MDFE" state={progressStates['MDFE']} onToggle={() => toggleProgress('MDFE')} />
            <input type="text" placeholder="FILIAL" value={capturedData.filial || ''} onChange={(e) => handleCaptureChange('filial', e.target.value)} />
            <input type="text" placeholder="Nº MDFE" value={capturedData.mdfe || ''} onChange={(e) => handleCaptureChange('mdfe', e.target.value)} />
            {capturedData.mdfe && (
              <div className="copy-section">
                <span>{`(MDFe • ${capturedData.mdfe}) - ${formData.motorista}`}</span>
                <button onClick={() => copyToClipboard(`(MDFe • ${capturedData.mdfe}) - ${formData.motorista}`)}>Copiar</button>
              </div>
            )}
            <Accordion title="Lembretes" isOpen={accordionStates['mdfe'] || false} onToggle={() => toggleAccordion('mdfe')}>
              - Selecionar Lotação<br />
              - Selecionar checked, caso tenha pedágio
            </Accordion>
          </div>
        ),
      });
    }

    if (selectedOptions.includes('PEDÁGIO')) {
      tabs.push({
        name: 'PEDÁGIO',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="PEDÁGIO" state={progressStates['PEDÁGIO']} onToggle={() => toggleProgress('PEDÁGIO')} />
            <input type="text" placeholder="VALE PEDAGIO" value={capturedData.valePedagio || ''} onChange={(e) => handleCaptureChange('valePedagio', e.target.value)} />
            <a href="https://www.roadcard.com.br/sistemapamcard/?loadGaScript=load" target="_blank" rel="noopener noreferrer"><button>Acessar RoadCard</button></a>
            <Accordion title="Informações" isOpen={accordionStates['ped'] || false} onToggle={() => toggleAccordion('ped')}>
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

    if (selectedOptions.includes('CTRB')) {
      tabs.push({
        name: 'CTRB',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="CTRB - CONTRATO DE FRETE" state={progressStates['CTRB']} onToggle={() => toggleProgress('CTRB')} />
            <input type="text" placeholder="CTRB" value={capturedData.ctrb || ''} onChange={(e) => handleCaptureChange('ctrb', e.target.value)} />
            {capturedData.ctrb && (
              <div className="copy-section">
                <span>{`(CTRB • ${capturedData.ctrb}) - ${formData.motorista}`}</span>
                <button onClick={() => copyToClipboard(`(CTRB • ${capturedData.ctrb}) - ${formData.motorista}`)}>Copiar</button>
              </div>
            )}
            <Accordion title="Informações" isOpen={accordionStates['ctrb'] || false} onToggle={() => toggleAccordion('ctrb')}>
              LIBERAÇÃO: {formData.liberacao || capturedData.liberacaoInput || ''}<br />
              CONTA BANCARIA: {formData.contaBancaria}<br />
              FRETE TERCEIRO CHEIO: {formData.freteTerceiroCheio}<br />
              FRETE TERCEIRO TOTAL: {formData.freteTerceiroTotal}
            </Accordion>
          </div>
        ),
      });
    }

    if (selectedOptions.includes('GUIA/DUPLICATA')) {
      tabs.push({
        name: 'GUIA/DUPLICATA',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="GNRE - GUIA DE ICMS" state={progressStates['GNRE - GUIA DE ICMS']} onToggle={() => toggleProgress('GNRE - GUIA DE ICMS')} />
            <input type="text" placeholder="GNRE/DUPLICATA" value={capturedData.gnreDuplicata || ''} onChange={(e) => handleCaptureChange('gnreDuplicata', e.target.value)} />
            {capturedData.cte && (
              <div className="copy-section">
                <span>{`(GNRE • ${capturedData.cte}) - ${formData.motorista}`}</span>
                <button onClick={() => copyToClipboard(`(GNRE • ${capturedData.cte}) - ${formData.motorista}`)}>Copiar</button>
              </div>
            )}
            <Accordion title="Informações" isOpen={accordionStates['gnre'] || false} onToggle={() => toggleAccordion('gnre')}>
              Informações adicionais sobre GNRE/DUPLICATA
            </Accordion>
            <EnqueteItem label="DUPLICATA" state={progressStates['DUPLICATA']} onToggle={() => toggleProgress('DUPLICATA')} />
            <a href="https://agile-trucker.vercel.app/" target="_blank" rel="noopener noreferrer"><button>Acessar Agile Trucker</button></a>
            <a href="https://www.gnre.pe.gov.br:444/gnre/v/guia/index" target="_blank" rel="noopener noreferrer"><button>Acessar GNRE</button></a>
          </div>
        ),
      });
    }

    tabs.push({
      name: 'PLANILHA PADRÃO',
      index: tabIndex++,
      content: (
        <div>
          <EnqueteItem label="PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA" state={progressStates['PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA']} onToggle={() => toggleProgress('PREENCHIMENTO COMPLETO E SALVAMENTO DA PLANILHA')} />
        </div>
      ),
    });

    if (selectedOptions.includes('ADIANTAMENTO')) {
      tabs.push({
        name: 'ADIANTAMENTO',
        index: tabIndex++,
        content: (
          <div>
            <EnqueteItem label="ADIANTAMENTO" state={progressStates['ADIANTAMENTO']} onToggle={() => toggleProgress('ADIANTAMENTO')} />
            <Accordion title="Informações" isOpen={accordionStates['adi'] || false} onToggle={() => toggleAccordion('adi')}>
              ADIANTAMENTO CTE LIBERADO | OPERAÇÃO ** | STATUS:<br />
              ADIANTAMENTO LIBERADO.<br />
              PAGAMENTO PENDENTE.<br />
              PLANILHA ATUALIZADA.
            </Accordion>
          </div>
        ),
      });
    }

    tabs.push({
      name: 'CARREGAMENTO E CONFERÊNCIA DE NOTAS',
      index: tabIndex++,
      content: (
        <div>
          <EnqueteItem label="CONFERÊNCIA DE NOTAS" state={progressStates['CONFERÊNCIA DE NOTAS']} onToggle={() => toggleProgress('CONFERÊNCIA DE NOTAS')} />
          <Accordion title="Informações" isOpen={accordionStates['confnotas'] || false} onToggle={() => toggleAccordion('confnotas')}>
            CONFERÊNCIA COM O NÚMERO DAS NOTAS DO MOTORISTA E DO CTE
          </Accordion>
          <EnqueteItem label="CONFIRMAR CARREGAMENTO" state={progressStates['CONFIRMAR CARREGAMENTO']} onToggle={() => toggleProgress('CONFIRMAR CARREGAMENTO')} />
          <EnqueteItem label="LIBERAR DOCUMENTAÇÕES" state={progressStates['LIBERAR DOCUMENTAÇÕES']} onToggle={() => toggleProgress('LIBERAR DOCUMENTAÇÕES')} />
        </div>
      ),
    });

    return tabs;
  };

  const tabs = getTabs();

  return (
    <div className="app">
      <Link to="/generator" target='_blank' hrefLang="en">
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#092d57ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            marginBottom: '20px',

          }}

        >
          Generator
        </button>
      </Link>
      <AnimatePresence>
        {showInitialScreen && (
          <motion.div
            className="initial-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo">Gerenciador de Transporte</div>
            <h2>Selecione a Operação e Motorista</h2>
            <div className="select-group">
              <select value={selectedOperacao} onChange={(e) => setSelectedOperacao(e.target.value)}>
                <option value="">Selecione a Operação</option>
                {operacoes.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              <select value={selectedTipoMotorista} onChange={(e) => setSelectedTipoMotorista(e.target.value)}>
                <option value="">Tipo de Motorista</option>
                {tipoMotoristaOptions.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <button onClick={handleIniciar} className="btn-iniciar">Iniciar Enquete</button>
          </motion.div>
        )}
      </AnimatePresence>

      {showEnquete && !showInitialScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="header-bar">
            <button onClick={resetAll} className="btn-voltar">Nova Enquete</button>
            <div className="info-op">
              <span>Operação: <strong>{operacoes.find(o => o.value === selectedOperacao)?.label}</strong></span>
              <span>Tipo: <strong>{tipoMotoristaOptions.find(t => t.value === selectedTipoMotorista)?.label}</strong></span>
            </div>
          </div>

          <div className="form-section">
  <h3>Dados do Transporte</h3>
  <div className="form-container">
    <div className="textarea-wrapper">
      <textarea
        style={{
          width: '100%',
          height: '100%',
          resize: 'none',
          padding: '10px',
          borderRadius: '12px',
          fontSize: '1.1rem',
          outline: 'none',
          background: '#142c46ff',
          color: '#ced7e0ff',
        }}
        name=""
        id=""
      ></textarea>
    </div>
    <div className="form-grid">
      {[
        { name: 'numeroPedido', label: 'Nº PEDIDO' },
        { name: 'motorista', label: 'MOTORISTA' },
        { name: 'cavalo', label: 'CAVALO' },
        { name: 'reboque', label: 'REBOQUE' },
        { name: 'linha', label: 'LINHA' },
        { name: 'proprietario', label: 'PROPRIETÁRIO (CNPJ/CPF)' },
        { name: 'itemFrete', label: 'ITEM FRETE' },
        { name: 'eixos', label: 'EIXOS' },
        { name: 'freteSemImposto', label: 'FRETE S/IMPOSTO' },
        { name: 'freteComImposto', label: 'FRETE C/IMPOSTO' },
        { name: 'contaBancaria', label: 'CONTA BANCÁRIA' },
        { name: 'freteTerceiroCheio', label: 'FRETE TERCEIRO CHEIO' },
        { name: 'freteTerceiroTotal', label: 'FRETE TERCEIRO TOTAL' },
      ].map((field) => (
        <input
          key={field.name}
          name={field.name}
          placeholder={field.label}
          value={formData[field.name as keyof FormData]}
          onChange={handleFormChange}
        />
      ))}
    </div>
  </div>
</div>


          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`tab-button ${activeTab === tab.name ? 'active' : ''} ${getTabStatus(tab.name)}`}
                >
                  {tab.index}º {tab.name}
                </button>
              ))}
            </div>
            <div className="tab-content">
              {tabs.find(tab => tab.name === activeTab)?.content}
            </div>
          </div>

          <div className="final-actions">
            <button onClick={createSummaryTxt}>CRIAR RESUMO.TXT</button>
            <button onClick={resetAll} className="btn-danger">APAGAR TUDO</button>
          </div>
        </motion.div>
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
    if (state === 'full') return '#27ae60';
    if (state === 'pending') return '#f39c12';
    return '#7f8c8d';
  };

  const getWidth = () => {
    if (state === 'full') return '100%';
    if (state === 'pending') return '60%';
    return '0%';
  };

  const getIcon = () => {
    if (state === 'full') return 'Concluído';
    if (state === 'pending') return 'Em Andamento';
    return 'Pendente';
  };

  return (
    <div className={`enquete-item ${state}`}>
      <span className="label">{label}</span>
      <div className="progress-container">

        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: getWidth() }}
          style={{ backgroundColor: getColor() }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <button onClick={onToggle} className={`status-btn ${state}`}>
        {getIcon()}
      </button>
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
      <button onClick={onToggle} className={isOpen ? 'open' : ''}>
        {title} {isOpen ? 'Esconder' : 'Mostrar'}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="accordion-content"
          >
            <div className="content-padding">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;