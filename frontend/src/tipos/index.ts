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
  position: number;
  listId: string;
  createdAt: string;
  updatedAt: string;
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
  lists: Lista[];
}
