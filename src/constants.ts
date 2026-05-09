
import { Landmark } from './types';

export const LANDMARK_DEFINITIONS: Omit<Landmark, 'x' | 'y'>[] = [
  { id: 'S', name: 'Sella', description: 'Center of sella turcica', category: 'Skeletal' },
  { id: 'N', name: 'Nasion', description: 'Frontonasal suture', category: 'Skeletal' },
  { id: 'A', name: 'A-point', description: 'Deepest point of maxilla', category: 'Skeletal' },
  { id: 'B', name: 'B-point', description: 'Deepest point of mandible apex', category: 'Skeletal' },
  { id: 'Pog', name: 'Pogonion', description: 'Most anterior point of chin', category: 'Skeletal' },
  { id: 'Me', name: 'Menton', description: 'Lowest point of symphysis', category: 'Skeletal' },
  { id: 'Go', name: 'Gonion', description: 'Point of the jaw angle', category: 'Skeletal' },
  { id: 'Or', name: 'Orbitale', description: 'Lowest point of orbital rim', category: 'Skeletal' },
  { id: 'Po', name: 'Porion', description: 'Highest point of external auditory meatus', category: 'Skeletal' },
  { id: 'ANS', name: 'ANS', description: 'Anterior Nasal Spine', category: 'Skeletal' },
  { id: 'PNS', name: 'PNS', description: 'Posterior Nasal Spine', category: 'Skeletal' },
  { id: 'Gn', name: 'Gnathion', description: 'Midpoint between Pog and Me', category: 'Skeletal' },
  { id: 'Ba', name: 'Basion', description: 'Anterior margin of foramen magnum', category: 'Skeletal' },
  { id: 'Pt', name: 'Pterygoid Point', description: 'Posterosuperior aspect of pterygomaxillary fissure', category: 'Skeletal' },
  { id: 'Ar', name: 'Articulare', description: 'Intersection of cranial base and posterior condyle', category: 'Skeletal' },
  { id: 'U1A', name: 'Upper Incisor Apex', description: 'Apex of upper central incisor', category: 'Dental' },
  { id: 'L1A', name: 'Lower Incisor Apex', description: 'Apex of lower central incisor', category: 'Dental' },
  { id: 'U1', name: 'Upper Incisor Edge', description: 'Tip of upper incisor', category: 'Dental' },
  { id: 'L1', name: 'Lower Incisor Edge', description: 'Tip of lower incisor', category: 'Dental' },
  { id: 'Pn', name: 'Pronasale', description: 'Tip of nose', category: 'Soft Tissue' },
  { id: 'Sn', name: 'Subnasale', description: 'Base of nasal septum', category: 'Soft Tissue' },
  { id: 'Li', name: 'Labrale Inferius', description: 'Point of lower lip', category: 'Soft Tissue' },
  { id: 'Ls', name: 'Labrale Superius', description: 'Point of upper lip', category: 'Soft Tissue' },
  { id: 'PgS', name: 'Soft Tissue Pogonion', description: 'Most anterior point of soft chin', category: 'Soft Tissue' },
];

export const ANALYSIS_GROUPS = [
  { name: 'Skeletal Linear', id: 'skeletal_linear' },
  { name: 'Skeletal Angular', id: 'skeletal_angular' },
  { name: 'Dental', id: 'dental' },
  { name: 'Soft Tissue', id: 'soft_tissue' },
];

export const ANALYSIS_TYPES = [
  { id: 'steiner', name: 'Steiner Analysis' },
  { id: 'jarabak', name: 'Jarabak Analysis' },
  { id: 'ricketts', name: 'Ricketts Analysis' },
  { id: 'eastman', name: 'Eastman Analysis' },
];
