
import { Landmark, AnalysisResult } from '../types';
import { calculateAngle, getAngleBetweenVectors, pointToLineDistance, calculateDistance } from './geometry';

export const runSteinerAnalysis = (landmarks: Landmark[]): AnalysisResult[] => {
  const getP = (id: string) => landmarks.find(l => l.id === id);
  const results: AnalysisResult[] = [];

  const S = getP('S');
  const N = getP('N');
  const A = getP('A');
  const B = getP('B');
  const Go = getP('Go');
  const Gn = getP('Gn');
  const U1 = getP('U1');
  const U1A = getP('U1A');
  const L1 = getP('L1');
  const L1A = getP('L1A');
  const Pg = getP('Pog');

  if (S && N && A) {
    const sna = calculateAngle(S, N, A);
    results.push({ name: 'SNA', value: sna, unit: '°', norm: '82° (±2)', interpretation: sna < 80 ? 'Maxillary Retrusion' : sna > 84 ? 'Maxillary Protrusion' : 'Normal Maxilla', category: 'Skeletal' });
  }

  if (S && N && B) {
    const snb = calculateAngle(S, N, B);
    results.push({ name: 'SNB', value: snb, unit: '°', norm: '80° (±2)', interpretation: snb < 78 ? 'Mandibular Retrusion' : snb > 82 ? 'Mandibular Protrusion' : 'Normal Mandible', category: 'Skeletal' });
  }

  if (S && N && A && B) {
    const sna = calculateAngle(S, N, A);
    const snb = calculateAngle(S, N, B);
    const anb = sna - snb;
    results.push({ name: 'ANB', value: anb, unit: '°', norm: '2° (±2)', interpretation: anb > 4 ? 'Class II' : anb < 0 ? 'Class III' : 'Class I Skeletal', category: 'Skeletal' });
  }
  
  if (Go && Gn && S && N) {
    const snGoGn = getAngleBetweenVectors(S, N, Go, Gn);
    results.push({ name: 'SN-GoGn', value: snGoGn, unit: '°', norm: '32°', interpretation: snGoGn > 32 ? 'Vertical Growth' : 'Horizontal Growth', category: 'Skeletal' });
  }

  if (U1 && U1A && N && A) {
    const u1NA = getAngleBetweenVectors(U1A, U1, N, A);
    results.push({ name: 'U1 to NA', value: u1NA, unit: '°', norm: '22°', interpretation: 'Upper Incisor Angulation', category: 'Dental' });
  }

  if (L1 && L1A && N && B) {
    const l1NB = getAngleBetweenVectors(L1A, L1, N, B);
    results.push({ name: 'L1 to NB', value: l1NB, unit: '°', norm: '25°', interpretation: 'Lower Incisor Angulation', category: 'Dental' });
  }

  return results;
};

export const runJarabakAnalysis = (landmarks: Landmark[]): AnalysisResult[] => {
  const getP = (id: string) => landmarks.find(l => l.id === id);
  const results: AnalysisResult[] = [];

  const S = getP('S');
  const N = getP('N');
  const Ar = getP('Ar');
  const Go = getP('Go');
  const Me = getP('Me');

  if (S && N && Ar) {
    const saddleAngle = calculateAngle(N, S, Ar);
    results.push({ name: 'Saddle Angle (N-S-Ar)', value: saddleAngle, unit: '°', norm: '123° (±5)', interpretation: saddleAngle > 128 ? 'Posterior Condyle Position' : 'Normal', category: 'Skeletal' });
  }

  if (S && Ar && Go) {
    const articularAngle = calculateAngle(S, Ar, Go);
    results.push({ name: 'Articular Angle (S-Ar-Go)', value: articularAngle, unit: '°', norm: '143° (±6)', interpretation: 'Mandibular Position', category: 'Skeletal' });
  }

  if (Ar && Go && Me) {
    const gonialAngle = calculateAngle(Ar, Go, Me);
    results.push({ name: 'Gonial Angle (Ar-Go-Me)', value: gonialAngle, unit: '°', norm: '130° (±7)', interpretation: 'Growth Direction', category: 'Skeletal' });
  }

  return results;
};

export const runRickettsAnalysis = (landmarks: Landmark[], pixelsPerMm: number): AnalysisResult[] => {
  const getP = (id: string) => landmarks.find(l => l.id === id);
  const results: AnalysisResult[] = [];

  const Pn = getP('Pn');
  const PgS = getP('PgS'); // Soft tissue pogonion
  const Li = getP('Li');
  const Ls = getP('Ls');
  const Po = getP('Po');
  const Or = getP('Or');
  const N = getP('N');
  const Pg = getP('Pog');
  const Pt = getP('Pt');
  const Gn = getP('Gn');

  // E-Plane to Lower Lip
  if (Pn && PgS && Li && pixelsPerMm) {
    const distLi = pointToLineDistance(Li, Pn, PgS, pixelsPerMm);
    // basic sign check: if x of Li is less than x of line on same y... we can improve this later. Use abs for now.
    results.push({ name: 'Lower Lip to E-Plane', value: distLi, unit: 'mm', norm: '-2mm', interpretation: distLi > 2 ? 'Protrusive Lip' : 'Normal', category: 'Soft Tissue' });
  }
  
  if (Pn && PgS && Ls && pixelsPerMm) {
    const distLs = pointToLineDistance(Ls, Pn, PgS, pixelsPerMm);
    results.push({ name: 'Upper Lip to E-Plane', value: distLs, unit: 'mm', norm: '-4mm', interpretation: distLs > 0 ? 'Protrusive Lip' : 'Normal', category: 'Soft Tissue' });
  }

  // Facial Angle
  if (Po && Or && N && Pg) {
    const facialAngle = getAngleBetweenVectors(Po, Or, N, Pg);
    results.push({ name: 'Facial Angle', value: facialAngle, unit: '°', norm: '87° (±3)', interpretation: facialAngle > 90 ? 'Protrusive Chin' : 'Normal', category: 'Skeletal' });
  }

  return results;
};

export const runEastmanAnalysis = (landmarks: Landmark[]): AnalysisResult[] => {
  const getP = (id: string) => landmarks.find(l => l.id === id);
  const results: AnalysisResult[] = [];
  
  const S = getP('S');
  const N = getP('N');
  const A = getP('A');
  const B = getP('B');
  const U1 = getP('U1');
  const U1A = getP('U1A');
  const L1 = getP('L1');
  const L1A = getP('L1A');

  if (S && N && A && B) {
    const sna = calculateAngle(S, N, A);
    const snb = calculateAngle(S, N, B);
    const anb = sna - snb;
    results.push({ name: 'SNA', value: sna, unit: '°', norm: '81°', interpretation: 'Maxillary AP', category: 'Skeletal' });
    results.push({ name: 'SNB', value: snb, unit: '°', norm: '79°', interpretation: 'Mandibular AP', category: 'Skeletal' });
    results.push({ name: 'ANB', value: anb, unit: '°', norm: '3°', interpretation: 'Skeletal Class', category: 'Skeletal' });
  }

  if (U1 && U1A && A && B) {
    // Maxillary incisor to Maxillary plane (wait, Eastman uses Maxillary plane PNS-ANS)
    const ANS = getP('ANS');
    const PNS = getP('PNS');
    if (ANS && PNS) {
      const u1MaxPlane = getAngleBetweenVectors(U1A, U1, PNS, ANS);
      results.push({ name: 'U1 to Maxillary Plane', value: u1MaxPlane, unit: '°', norm: '109°', interpretation: 'Incisor Angulation', category: 'Dental' });
    }
  }

  if (L1 && L1A && B && getP('Go') && getP('Me')) {
    const Go = getP('Go');
    const Me = getP('Me');
    if (Go && Me) {
      const l1MandPlane = 180 - getAngleBetweenVectors(L1A, L1, Go, Me);
      results.push({ name: 'L1 to Mandibular Plane', value: l1MandPlane, unit: '°', norm: '93°', interpretation: 'Incisor Angulation', category: 'Dental' });
    }
  }

  return results;
};
