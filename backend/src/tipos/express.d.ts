declare global {
  namespace Express {
    interface Request {
      idUsuario: string;
    }
  }
}

export {};
