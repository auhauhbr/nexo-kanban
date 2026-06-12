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
  position: number;
  listId: string;
  createdAt: string;
  updatedAt: string;
  labels: Etiqueta[];
  checklists: Checklist[];
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
  cards: Cartao[];
}

export interface Quadro extends Omit<ResumoQuadro, "_count"> {
  labels: Etiqueta[];
  lists: Lista[];
}
