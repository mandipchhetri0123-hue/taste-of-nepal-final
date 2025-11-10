export type MenuItem = {
  id: string;
  name: string;
  category: 'standard' | 'premium' | 'deluxe';
  price: number;
  description?: string;
  imageUrl?: string;
};

export type CartLine = {
  id: string;        // menu item id
  name: string;
  price: number;
  qty: number;
};
