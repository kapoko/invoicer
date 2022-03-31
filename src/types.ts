import currencies from "./currencies.json";

export type Client = {
  id: number;
  company: string;
  contact: string;
  address: string;
  zipcode: string;
  city: string;
  country?: string;
  vatId?: string;
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

export type Currency = keyof typeof currencies;

export type InvoiceYAML = {
  to: number;
  date: Date;
  currency?: Currency;
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

export type VatIndex = {
  [key: number]: number;
};

export type InvoiceData = {
  company: Company;
  client: Client;
  invoiceNumber: number;
  date: Date;
  items: InvoiceDataItem[];
  subtotal: number;
  vat: VatIndex;
  total: number;
  currency: Currency;
};

export type Config = {
  clients: Client[];
  company: Company;
  invoice: {
    prefix: string;
    template: string;
    defaultVat: number;
    defaultCurrency: Currency;
    locale: string;
    paymentTerm: number;
    outDir?: string;
  };
};
