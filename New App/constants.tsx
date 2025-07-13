

import React from 'react';
import { ProcedureType, AnesthesiaType, PatientStatus } from './types';
import { TranslationKeys } from './i18n';

// Stable keys for gastroscopy regions
export const GASTROSCOPY_REGION_KEYS = {
    esophagus: 'esophagus',
    gej: 'gej',
    stomach_content: 'stomach_content',
    stomach_fundus: 'stomach_fundus',
    stomach_body: 'stomach_body',
    stomach_antrum: 'stomach_antrum',
    stomach_pylorus: 'stomach_pylorus',
    duodenum_bulb: 'duodenum_bulb',
    duodenum_second_part: 'duodenum_second_part',
};

// Stable keys for colonoscopy regions
export const COLONOSCOPY_REGION_KEYS = {
    rectum: 'rectum',
    sigmoid_colon: 'sigmoid_colon',
    descending_colon: 'descending_colon',
    transverse_colon: 'transverse_colon',
    ascending_colon: 'ascending_colon',
    cecum: 'cecum',
    terminal_ileum: 'terminal_ileum',
};

// Stable keys for ERCP regions
export const ERCP_REGION_KEYS = {
    papilla_of_vater: 'papilla_of_vater',
    common_bile_duct: 'common_bile_duct',
    pancreatic_duct: 'pancreatic_duct',
};

// Stable keys for EUS regions
export const EUS_REGION_KEYS = {
    esophagus: 'eus_esophagus',
    stomach: 'eus_stomach',
    duodenum: 'eus_duodenum',
    pancreas: 'eus_pancreas',
    bile_duct: 'eus_bile_duct',
    liver: 'eus_liver',
    mediastinum: 'eus_mediastinum',
};

// Stable keys for Cholangioscopy regions
export const CHOLANGIOSCOPY_REGION_KEYS = {
    bile_duct_lumen: 'bile_duct_lumen',
    bile_duct_wall: 'bile_duct_wall',
    intrahepatic_ducts: 'intrahepatic_ducts',
};

// Stable keys for Enteroscopy regions
export const ENTEROSCOPY_REGION_KEYS = {
    duodenum: 'enteroscopy_duodenum',
    jejunum: 'jejunum',
    ileum: 'ileum',
};

export const REGIONS_BY_PROCEDURE = {
  [ProcedureType.GASTROSCOPY]: Object.values(GASTROSCOPY_REGION_KEYS),
  [ProcedureType.COLONOSCOPY]: Object.values(COLONOSCOPY_REGION_KEYS),
  [ProcedureType.ERCP]: Object.values(ERCP_REGION_KEYS),
  [ProcedureType.EUS]: Object.values(EUS_REGION_KEYS),
  [ProcedureType.CHOLANGIOSCOPY]: Object.values(CHOLANGIOSCOPY_REGION_KEYS),
  [ProcedureType.ENTEROSCOPY]: Object.values(ENTEROSCOPY_REGION_KEYS),
};

// Function to get report diagnosis templates based on the current language
export const getReportTemplates = (t: (key: TranslationKeys) => string) => {
  const gastroscopyNormalFindings = Object.fromEntries(
    Object.values(GASTROSCOPY_REGION_KEYS).map(key => [key, t('normal')])
  );

  const colonoscopyNormalFindings = Object.fromEntries(
    Object.values(COLONOSCOPY_REGION_KEYS).map(key => [key, t('normal')])
  );

  return {
    [ProcedureType.GASTROSCOPY]: {
      diagnosis: t('template_gastroscopy_diagnosis'),
      consent: t('template_consent'),
      indication: t('template_gastroscopy_indication'),
      recommendation: t('template_recommendation'),
      anesthesiaType: AnesthesiaType.MAC,
      patientStatus: PatientStatus.OUTPATIENT,
      findings: gastroscopyNormalFindings,
    },
    [ProcedureType.COLONOSCOPY]: {
      diagnosis: t('template_colonoscopy_diagnosis'),
      consent: t('template_consent'),
      indication: t('template_colonoscopy_indication'),
      recommendation: t('template_recommendation'),
      anesthesiaType: AnesthesiaType.MAC,
      patientStatus: PatientStatus.OUTPATIENT,
      findings: colonoscopyNormalFindings,
      bostonBowelPrepScale: { right: 3, transverse: 3, left: 3 },
    },
    [ProcedureType.ERCP]: {
      diagnosis: t('template_ercp_diagnosis'),
      consent: t('template_consent'),
      indication: t('template_ercp_indication'),
      recommendation: t('template_recommendation'),
      anesthesiaType: AnesthesiaType.GENERAL,
      patientStatus: PatientStatus.INPATIENT,
    },
    [ProcedureType.EUS]: {
      diagnosis: t('template_eus_diagnosis'),
      consent: t('template_consent'),
      indication: t('template_eus_indication'),
      recommendation: t('template_recommendation'),
      anesthesiaType: AnesthesiaType.MAC,
      patientStatus: PatientStatus.OUTPATIENT,
    },
    [ProcedureType.CHOLANGIOSCOPY]: {
      diagnosis: t('template_cholangioscopy_diagnosis'),
      consent: t('template_consent'),
      indication: t('template_cholangioscopy_indication'),
      recommendation: t('template_recommendation'),
      anesthesiaType: AnesthesiaType.GENERAL,
      patientStatus: PatientStatus.INPATIENT,
    },
    [ProcedureType.ENTEROSCOPY]: {
      diagnosis: t('template_enteroscopy_diagnosis'),
      consent: t('template_consent'),
      indication: t('template_enteroscopy_indication'),
      recommendation: t('template_recommendation'),
      anesthesiaType: AnesthesiaType.GENERAL,
      patientStatus: PatientStatus.INPATIENT,
    }
  };
};

export const ICONS = {
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>,
  patients: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  tools: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  add: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  camera: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  ai: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 8.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5z"/><path d="M20.22 8.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5z"/><path d="M8.5 15a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5z"/><path d="M12.5 15a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5z"/><path d="M22 11.5v.5a.5.5 0 0 1-.5.5h-.5a.5.5 0 0 1-.5-.5v-.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5z"/><path d="M8 12a4 4 0 0 0 4 4 4 4 0 0 0 4-4H8z"/><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="m8 12 1.45-2.9A4 4 0 0 1 12 8a4 4 0 0 1 2.55 1.1L16 12Z"/></svg>,
  pdf: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15v-4H7v4h2Z"/><path d="M12.5 11h1.5a2 2 0 0 1 0 4h-1.5v-4Z"/><path d="M17 11h-1.5a2 2 0 0 0 0 4h1.5"/></svg>,
  close: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  back: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
  guidelines: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>,
};