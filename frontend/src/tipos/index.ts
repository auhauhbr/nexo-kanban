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
