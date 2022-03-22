export type Client = {
  id: number;
  company: string;
  contact: string;
  address: string;
  zipcode: string;
  city: string;
  country?: string;
};

export type Company = {
  name: string;
  accountHolder: string;
  address: string;
  zipcode: string;
  city: string;
  vat: string;
  coc: string;
  iban: string;
  phone: string;
  email: string;
};

export type Config = {
  clients: Client[];
  company: Company;
};
