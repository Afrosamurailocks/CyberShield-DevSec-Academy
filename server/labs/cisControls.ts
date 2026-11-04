/**
 * Base dos 18 Controles do CIS Critical Security Controls v8.1.
 *
 * Verificado em cisecurity.org (páginas "CIS Controls list" e "v8.1"): títulos oficiais dos 18 controles,
 * versão v8.1 publicada em 24/06/2024, 18 controles e 153 salvaguardas (IG1 = 56). Não foi encontrada
 * versão posterior (v9 ou edição 2026) no site oficial.
 *
 * NÃO verificado nesta sessão: a lista oficial de salvaguardas (IDs, títulos e IG) não pôde ser extraída
 * do site (está em imagem/planilha com cadastro). Os IDs abaixo são uma SELEÇÃO EDITORIAL a conferir
 * no CIS Controls Navigator v8.1 antes de uso como referência formal. Nenhum IG é afirmado aqui.
 */
import type { Safeguard } from './privacy.js';

export interface CisControlBase {
  n: number;
  code: string;
  en: string;           // título oficial (inglês)
  pt: string;           // título em português (tradução editorial)
  summary: string;      // resumo curto (paráfrase)
  minutes: number;
  safeguards: Safeguard[];
}

const sg = (id: string, title: string): Safeguard => ({ id, title });

export const CIS_BASE: CisControlBase[] = [
  { n: 1, code: 'C01', en: 'Inventory and Control of Enterprise Assets', pt: 'Inventário e controle de ativos corporativos',
    summary: 'Saiba o que existe na rede: dispositivos de usuário, servidores, rede, IoT e nuvem, e ache o que não deveria estar lá.', minutes: 14,
    safeguards: [sg('1.1', 'Estabelecer e manter um inventário detalhado de ativos corporativos'), sg('1.2', 'Tratar ativos não autorizados'), sg('1.3', 'Usar uma ferramenta de descoberta ativa')] },
  { n: 2, code: 'C02', en: 'Inventory and Control of Software Assets', pt: 'Inventário e controle de ativos de software',
    summary: 'Só software conhecido, autorizado e suportado deve rodar. O que não está no inventário não está sendo protegido.', minutes: 14,
    safeguards: [sg('2.1', 'Estabelecer e manter um inventário de software'), sg('2.2', 'Garantir que o software autorizado ainda tem suporte'), sg('2.3', 'Tratar software não autorizado')] },
  { n: 3, code: 'C03', en: 'Data Protection', pt: 'Proteção de dados',
    summary: 'Identificar, classificar, tratar, reter e descartar dados com segurança, e proteger o que é sensível.', minutes: 14,
    safeguards: [sg('3.1', 'Estabelecer e manter um processo de gestão de dados'), sg('3.3', 'Configurar listas de controle de acesso a dados'), sg('3.6', 'Criptografar dados em dispositivos de usuário'), sg('3.11', 'Criptografar dados sensíveis em repouso')] },
  { n: 4, code: 'C04', en: 'Secure Configuration of Enterprise Assets and Software', pt: 'Configuração segura de ativos e software',
    summary: 'Configurações padrão costumam ser inseguras. Defina, aplique e mantenha uma configuração segura.', minutes: 14,
    safeguards: [sg('4.1', 'Estabelecer e manter um processo de configuração segura'), sg('4.7', 'Gerenciar contas padrão de ativos e software'), sg('4.8', 'Desinstalar ou desativar serviços desnecessários')] },
  { n: 5, code: 'C05', en: 'Account Management', pt: 'Gestão de contas',
    summary: 'Contas de usuário, administrador e de serviço precisam de dono, inventário e ciclo de vida.', minutes: 14,
    safeguards: [sg('5.1', 'Estabelecer e manter um inventário de contas'), sg('5.3', 'Desativar contas inativas'), sg('5.4', 'Restringir privilégios de administrador a contas dedicadas')] },
  { n: 6, code: 'C06', en: 'Access Control Management', pt: 'Gestão de controle de acesso',
    summary: 'Conceda, altere e revogue acessos pelo mínimo necessário, e exija autenticação forte (MFA) onde o risco é maior.', minutes: 14,
    safeguards: [sg('6.1', 'Estabelecer um processo de concessão de acesso'), sg('6.2', 'Estabelecer um processo de revogação de acesso'), sg('6.3', 'Exigir MFA para aplicações expostas externamente'), sg('6.4', 'Exigir MFA para acesso remoto à rede'), sg('6.5', 'Exigir MFA para acesso administrativo')] },
  { n: 7, code: 'C07', en: 'Continuous Vulnerability Management', pt: 'Gestão contínua de vulnerabilidades',
    summary: 'Avalie e corrija vulnerabilidades continuamente para encurtar a janela em que um atacante pode explorá-las.', minutes: 14,
    safeguards: [sg('7.1', 'Estabelecer e manter um processo de gestão de vulnerabilidades'), sg('7.2', 'Estabelecer e manter um processo de remediação'), sg('7.3', 'Automatizar a gestão de patches do sistema operacional'), sg('7.4', 'Automatizar a gestão de patches de aplicações'), sg('7.5', 'Executar varreduras automáticas de vulnerabilidades internas')] },
  { n: 8, code: 'C08', en: 'Audit Log Management', pt: 'Gestão de logs de auditoria',
    summary: 'Colete, centralize, revise e retenha logs que permitam detectar, investigar e se recuperar de incidentes.', minutes: 14,
    safeguards: [sg('8.1', 'Estabelecer e manter um processo de gestão de logs de auditoria'), sg('8.2', 'Coletar logs de auditoria'), sg('8.3', 'Garantir armazenamento adequado de logs'), sg('8.9', 'Centralizar logs de auditoria'), sg('8.10', 'Reter logs de auditoria')] },
  { n: 9, code: 'C09', en: 'Email and Web Browser Protections', pt: 'Proteções de e-mail e navegador',
    summary: 'Reduza o que chega por e-mail e navegação: clientes suportados, filtros e autenticação de e-mail.', minutes: 14,
    safeguards: [sg('9.1', 'Usar apenas navegadores e clientes de e-mail com suporte completo'), sg('9.2', 'Usar serviços de filtragem de DNS'), sg('9.5', 'Implementar DMARC'), sg('9.7', 'Manter proteção anti-malware nos servidores de e-mail')] },
  { n: 10, code: 'C10', en: 'Malware Defenses', pt: 'Defesas contra malware',
    summary: 'Impeça ou controle a instalação, a propagação e a execução de código malicioso.', minutes: 14,
    safeguards: [sg('10.1', 'Implantar e manter software anti-malware'), sg('10.2', 'Configurar atualização automática de assinaturas'), sg('10.3', 'Desativar autorun e autoplay em mídias removíveis')] },
  { n: 11, code: 'C11', en: 'Data Recovery', pt: 'Recuperação de dados',
    summary: 'Tenha backups que funcionam, protegidos e testados, para restaurar ao estado confiável depois de um incidente.', minutes: 14,
    safeguards: [sg('11.1', 'Estabelecer e manter um processo de recuperação de dados'), sg('11.2', 'Executar backups automatizados'), sg('11.3', 'Proteger os dados de recuperação'), sg('11.4', 'Manter uma cópia isolada dos dados de recuperação'), sg('11.5', 'Testar a recuperação de dados')] },
  { n: 12, code: 'C12', en: 'Network Infrastructure Management', pt: 'Gestão da infraestrutura de rede',
    summary: 'Gerencie ativamente os dispositivos de rede para evitar a exploração de serviços e pontos de acesso vulneráveis.', minutes: 14,
    safeguards: [sg('12.1', 'Manter a infraestrutura de rede atualizada'), sg('12.2', 'Estabelecer e manter uma arquitetura de rede segura'), sg('12.3', 'Gerenciar a infraestrutura de rede com segurança')] },
  { n: 13, code: 'C13', en: 'Network Monitoring and Defense', pt: 'Monitoramento e defesa da rede',
    summary: 'Monitore a rede e aja sobre os alertas: de nada adianta detectar se ninguém responde.', minutes: 14,
    safeguards: [sg('13.1', 'Centralizar o alerta de eventos de segurança'), sg('13.2', 'Implantar detecção de intrusão em hosts'), sg('13.3', 'Implantar detecção de intrusão na rede'), sg('13.11', 'Ajustar limiares dos alertas de segurança')] },
  { n: 14, code: 'C14', en: 'Security Awareness and Skills Training', pt: 'Treinamento de conscientização e habilidades em segurança',
    summary: 'Pessoas são alvo e também defesa. Mantenha um programa contínuo, com foco em engenharia social e em reportar.', minutes: 14,
    safeguards: [sg('14.1', 'Estabelecer e manter um programa de conscientização'), sg('14.2', 'Treinar para reconhecer engenharia social'), sg('14.3', 'Treinar em boas práticas de autenticação'), sg('14.6', 'Treinar para reconhecer e reportar incidentes')] },
  { n: 15, code: 'C15', en: 'Service Provider Management', pt: 'Gestão de provedores de serviço',
    summary: 'Avalie e acompanhe fornecedores que tratam dados sensíveis ou operam plataformas críticas.', minutes: 14,
    safeguards: [sg('15.1', 'Estabelecer e manter um inventário de provedores'), sg('15.2', 'Estabelecer e manter uma política de gestão de provedores'), sg('15.4', 'Garantir requisitos de segurança nos contratos'), sg('15.6', 'Monitorar provedores de serviço')] },
  { n: 16, code: 'C16', en: 'Application Software Security', pt: 'Segurança de software de aplicação',
    summary: 'Gerencie o ciclo de vida de segurança do software desenvolvido, hospedado ou adquirido.', minutes: 14,
    safeguards: [sg('16.1', 'Estabelecer e manter um processo de desenvolvimento seguro'), sg('16.2', 'Estabelecer um processo para receber e tratar vulnerabilidades'), sg('16.4', 'Manter inventário de componentes de terceiros'), sg('16.12', 'Implementar verificações de segurança no código')] },
  { n: 17, code: 'C17', en: 'Incident Response Management', pt: 'Gestão de resposta a incidentes',
    summary: 'Tenha pessoas, processo e contatos definidos antes do incidente, e ensaie.', minutes: 14,
    safeguards: [sg('17.1', 'Designar responsáveis pela gestão de incidentes'), sg('17.2', 'Manter contatos para reporte de incidentes'), sg('17.3', 'Estabelecer um processo corporativo de reporte'), sg('17.4', 'Estabelecer e manter um processo de resposta a incidentes'), sg('17.7', 'Realizar exercícios periódicos de resposta')] },
  { n: 18, code: 'C18', en: 'Penetration Testing', pt: 'Teste de invasão',
    summary: 'Teste a eficácia das defesas simulando ações de atacantes, com escopo e autorização formais.', minutes: 14,
    safeguards: [sg('18.1', 'Estabelecer e manter um programa de testes de invasão'), sg('18.3', 'Corrigir os achados dos testes de invasão'), sg('18.5', 'Realizar testes de invasão internos periódicos')] },
];
