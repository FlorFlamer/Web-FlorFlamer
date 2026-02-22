export type ProjectTag = string;
export type ProjectSoftware = string;

export type Project = {
  id: string;          // "flint-flamer"
  title: string;       // "Flint Flamer"
  year: number;        // 2026 / 2027
  tags: ProjectTag[];  // ["2D", "Animation"]
  software: ProjectSoftware[]; // ["Blender", "After Effects"]

  // Visual / UI
  vhsCode: string;     // "VHS_A01"
  accent?: string;     // opcional (para cores no futuro)
  icon?: string;       // path opcional / ou id
  logo?: string;       // path opcional (quando fizeres o logo-image)

  // TV / hero
  heroImage: string;   // "/img/projects/flint/hero.webp"

  // Texto (para a box à direita no futuro)
  summary?: string;
};