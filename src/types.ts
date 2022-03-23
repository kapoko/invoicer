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

type InvoiceYAMLItem = {
  t: string;
  p: number;
  v?: number;
  a?: number;
  u?: string;
  d?: string;
};

export type InvoiceYAML = {
  to: number;
  date: Date;
  items: InvoiceYAMLItem[];
};

export type InvoiceDataItem = {
  title: string;
  price: number;
  amount: number;
  unit?: string;
  description?: string;
  vat: number;
  total: number;
};

export type InvoiceData = {
  company: Company;
  client: Client;
  invoiceNumber: number;
  date: Date;
  items: InvoiceDataItem[];
  subtotal: number;
  vat: {
    [key: number]: number;
  };
  total: number;
};

export type Config = {
  clients: Client[];
  company: Company;
  invoice: {
    prefix: number;
    template: string;
    defaultVat: number;
    locale: string;
  };
};
