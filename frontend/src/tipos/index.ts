export interface Usuario {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface RespostaAutenticacao {
  user: Usuario;
  token: string;
}

export interface ResumoQuadro {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lists: number;
  };
}

export interface Cartao {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  number: number;
  coverColor: string | null;
  archived: boolean;
  position: number;
  listId: string;
  createdAt: string;
  updatedAt: string;
  labels: Etiqueta[];
  checklists: Checklist[];
  activities: Atividade[];
  attachments: Anexo[];
}

export interface Atividade {
  id: string;
  type: string;
  message: string;
  cardId: string;
  userId: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface Anexo {
  id: string;
  title: string;
  url: string;
  cardId: string;
  createdAt: string;
}

export interface Etiqueta {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemChecklist {
  id: string;
  text: string;
  done: boolean;
  position: number;
  checklistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  title: string;
  position: number;
  cardId: string;
  createdAt: string;
  updatedAt: string;
  items: ItemChecklist[];
}

export interface Lista {
  id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  wipLimit: number | null;
  cards: Cartao[];
}

export interface ListaArquivada extends Omit<Lista, "cards"> {
  _count: { cards: number };
}

export interface CartaoArquivado
  extends Omit<Cartao, "labels" | "checklists" | "activities" | "attachments"> {
  list: { id: string; title: string; archived: boolean };
}

export interface ArquivadosQuadro {
  lists: ListaArquivada[];
  cards: CartaoArquivado[];
}

export interface Quadro extends Omit<ResumoQuadro, "_count"> {
  labels: Etiqueta[];
  lists: Lista[];
}
