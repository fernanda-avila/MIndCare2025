export type Professional = {
  avatarUrl?: any;
  id: number;
  userId?: number | null;
  name: string;
  specialty?: string | null;
  bio?: string | null;
  shortBio?: string | null;
  price?: number | null; // preço por sessão
  rating?: number | null; // 0-5
  location?: string | null;
  active?: boolean;
  createdAt?: string;
};
