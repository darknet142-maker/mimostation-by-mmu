import type { OperatorId, Station } from '@/types';

export type { OperatorId };

/**
 * Registre officiel des enseignes (opérateurs pétroliers) présentes au Gabon.
 * Chaque enseigne fournit son logo et sa couverture en SVG vectoriel,
 * ainsi que sa charte couleurs appliquée par défaut à ses stations.
 */

export interface OperatorBrand {
  id: OperatorId;
  name: string;
  legalName: string;
  logo: string;
  cover: string;
  primaryColor: string;
  secondaryColor: string;
  canopyTheme: NonNullable<Station['canopyTheme']>;
}

export const OPERATORS: readonly OperatorBrand[] = [
  {
    id: 'totalenergies',
    name: 'TotalEnergies',
    legalName: 'TotalEnergies Marketing Gabon',
    logo: '/assets/brand/totalenergies.svg',
    cover: '/assets/scenes/cover-totalenergies.svg',
    primaryColor: '#ED1C24',
    secondaryColor: '#242933',
    canopyTheme: 'urban-orange',
  },
  {
    id: 'ola-energy',
    name: 'OLA Energy',
    legalName: 'OLA Energy Gabon',
    logo: '/assets/brand/ola-energy.svg',
    cover: '/assets/scenes/cover-ola-energy.svg',
    primaryColor: '#00529B',
    secondaryColor: '#FF5A00',
    canopyTheme: 'classic-blue',
  },
  {
    id: 'petrogabon',
    name: 'PetroGabon',
    legalName: 'PetroGabon',
    logo: '/assets/brand/petrogabon.svg',
    cover: '/assets/scenes/cover-petrogabon.svg',
    primaryColor: '#008751',
    secondaryColor: '#FFC107',
    canopyTheme: 'eco-green',
  },
  {
    id: 'engen',
    name: 'Engen',
    legalName: 'Engen (Vivo Energy Gabon)',
    logo: '/assets/brand/engen.svg',
    cover: '/assets/scenes/cover-engen.svg',
    primaryColor: '#002D72',
    secondaryColor: '#E31B23',
    canopyTheme: 'night-edition',
  },
  {
    id: 'gab-oil',
    name: "Gab'Oil",
    legalName: "Gab'Oil Distribution",
    logo: '/assets/brand/gab-oil.svg',
    cover: '/assets/scenes/station-front.svg',
    primaryColor: '#D9232A',
    secondaryColor: '#4B5563',
    canopyTheme: 'urban-orange',
  },
];

/** Rattachement par défaut des stations de démonstration (données persistées antérieures). */
const DEFAULT_OPERATOR_BY_STATION: Record<string, OperatorId> = {
  'station-liberte': 'totalenergies',
  'station-etoile': 'ola-energy',
  'station-mbolo': 'petrogabon',
  'station-ocean': 'engen',
  'station-akanda': 'ola-energy',
  'station-owendo': 'petrogabon',
};

export const getOperator = (id: OperatorId | undefined): OperatorBrand | undefined =>
  OPERATORS.find(o => o.id === id);

export interface ResolvedStationBranding {
  operator: OperatorBrand | undefined;
  logo: string;
  cover: string;
  primaryColor: string;
  secondaryColor: string;
}

/** Résout l'habillage effectif d'une station : surcharge station > charte enseigne > défaut plateforme. */
export const resolveStationBranding = (
  station: Pick<Station, 'id' | 'operatorId' | 'logoUrl' | 'coverImage' | 'primaryColor' | 'secondaryColor'>
): ResolvedStationBranding => {
  const operator = getOperator(station.operatorId ?? DEFAULT_OPERATOR_BY_STATION[station.id]);
  return {
    operator,
    logo: station.logoUrl || operator?.logo || '/assets/brand/logo-mark.svg',
    cover: station.coverImage || operator?.cover || '/assets/scenes/station-front.svg',
    primaryColor: station.primaryColor || operator?.primaryColor || '#0B4DB3',
    secondaryColor: station.secondaryColor || operator?.secondaryColor || '#FFC107',
  };
};

/** Taille maximale d'un SVG téléversé (logo ou couverture). */
export const MAX_SVG_UPLOAD_BYTES = 128 * 1024;

const UNSAFE_SVG_PATTERN =
  /<script\b|<foreignObject\b|javascript:|vbscript:|\bon[a-z]+\s*=/i;

/**
 * Lit et valide un fichier SVG téléversé puis le convertit en data-URL.
 * Rejette tout SVG contenant des scripts, foreignObject, pseudo-protocoles ou gestionnaires inline.
 */
export const readSvgFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    if (!isSvg) {
      reject(new Error('Format refusé : seuls les fichiers SVG sont acceptés.'));
      return;
    }
    if (file.size > MAX_SVG_UPLOAD_BYTES) {
      reject(new Error('Fichier trop volumineux (128 Ko maximum).'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      if (!/<svg[\s>]/i.test(text)) {
        reject(new Error('Le fichier ne contient pas de SVG valide.'));
        return;
      }
      if (UNSAFE_SVG_PATTERN.test(text)) {
        reject(new Error('Contenu SVG refusé : balises actives ou scripts non autorisés.'));
        return;
      }
      resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`);
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsText(file);
  });

/**
 * Lit une image publicitaire (JPG, PNG, WebP, AVIF ou SVG) envoyée par une station
 * pour le carrousel d'accueil Full HD (1920x1080).
 * Redimensionne proprement les rasters au format 1920x1080 (object-cover) compressé.
 */
export const readAdBannerImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    if (isSvg) {
      readSvgFile(file).then(resolve).catch(reject);
      return;
    }

    const allowedRaster = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedRaster.includes(file.type) && !/\.(jpe?g|png|webp|avif)$/i.test(file.name)) {
      reject(new Error('Format non supporté. Utilisez JPG, PNG, WebP, AVIF ou SVG (1920×1080).'));
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('Fichier image trop volumineux (12 Mo maximum).'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const targetW = 1920;
        const targetH = 1080;
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Impossible de traiter l’image dans le navigateur.'));
          return;
        }

        // Cover-fit 16:9 (1920x1080 Full HD)
        const srcRatio = img.width / Math.max(1, img.height);
        const dstRatio = targetW / targetH;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;
        if (srcRatio > dstRatio) {
          sw = img.height * dstRatio;
          sx = (img.width - sw) / 2;
        } else if (srcRatio < dstRatio) {
          sh = img.width / dstRatio;
          sy = (img.height - sh) / 2;
        }

        ctx.fillStyle = '#0A1D37';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

        const dataUrl = canvas.toDataURL('image/webp', 0.84);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Échec de conversion au format Full HD 1920×1080.'));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image illisible ou corrompue.'));
    };
    img.src = objectUrl;
  });
