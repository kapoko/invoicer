import currencies from "../currencies.json" with { type: "json" };
import type { Config, InvoiceYAML } from "../types.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const fail = (source: string, field: string, expected: string): never => {
  throw new Error(`${source}: ${field} must be ${expected}`);
};

const isCurrency = (value: unknown) =>
  typeof value === "string" && value in currencies;

const isDate = (value: unknown) => {
  if (value instanceof Date) return !Number.isNaN(value.getTime());

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) &&
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` ===
      value
  );
};

export const validateConfig = (value: unknown): Config => {
  const source = "Config file";
  if (!isRecord(value)) {
    return fail(source, "root", "a mapping");
  }
  if (!isRecord(value.invoice)) {
    return fail(source, "invoice", "a mapping");
  }
  if (!isRecord(value.company)) {
    return fail(source, "company", "a mapping");
  }
  if (!Array.isArray(value.clients)) {
    return fail(source, "clients", "a list");
  }

  const { invoice, clients } = value;
  if (typeof invoice.template !== "string" || !invoice.template) {
    fail(source, "invoice.template", "a non-empty string");
  }
  if (typeof invoice.prefix !== "string") {
    fail(source, "invoice.prefix", "a string");
  }
  if (!Number.isFinite(invoice.defaultVat)) {
    fail(source, "invoice.defaultVat", "a finite number");
  }
  if (!isCurrency(invoice.defaultCurrency)) {
    fail(source, "invoice.defaultCurrency", "a supported ISO currency code");
  }
  if (typeof invoice.locale !== "string" || !invoice.locale) {
    fail(source, "invoice.locale", "a non-empty locale string");
  }
  if (!Number.isFinite(invoice.paymentTerm)) {
    fail(source, "invoice.paymentTerm", "a finite number");
  }
  if (
    invoice.outDir !== undefined &&
    invoice.outDir !== null &&
    typeof invoice.outDir !== "string"
  ) {
    fail(source, "invoice.outDir", "a string");
  }
  if (
    invoice.onlyGenerateStartingWith !== undefined &&
    invoice.onlyGenerateStartingWith !== null &&
    typeof invoice.onlyGenerateStartingWith !== "string" &&
    typeof invoice.onlyGenerateStartingWith !== "number"
  ) {
    fail(source, "invoice.onlyGenerateStartingWith", "a string or number");
  }

  const clientIds = new Set<number>();
  for (const [index, client] of clients.entries()) {
    if (!isRecord(client)) fail(source, `clients[${index}]`, "a mapping");
    if (!Number.isInteger(client.id)) {
      fail(source, `clients[${index}].id`, "an integer");
    }
    if (clientIds.has(client.id)) {
      throw new Error(`${source}: clients[${index}].id must be unique`);
    }
    clientIds.add(client.id);
  }

  return value as Config;
};

export const validateInvoice = (
  value: unknown,
  source: string,
): InvoiceYAML => {
  if (!isRecord(value)) {
    return fail(source, "root", "a mapping");
  }
  if (!Number.isInteger(value.to)) {
    return fail(source, "to", "an integer");
  }
  if (!isDate(value.date)) {
    return fail(source, "date", "a valid YYYY-MM-DD date");
  }
  if (value.currency !== undefined && !isCurrency(value.currency)) {
    fail(source, "currency", "a supported ISO currency code");
  }
  const { items } = value;
  if (!Array.isArray(items) || !items.length) {
    return fail(source, "items", "a non-empty list");
  }

  for (const [index, item] of items.entries()) {
    const field = `items[${index}]`;
    if (!isRecord(item)) fail(source, field, "a mapping");
    if (typeof item.t !== "string" || !item.t.trim()) {
      fail(source, `${field}.t`, "a non-empty string");
    }
    if (!Number.isFinite(item.p)) fail(source, `${field}.p`, "a finite number");
    if (item.a !== undefined && !Number.isFinite(item.a)) {
      fail(source, `${field}.a`, "a finite number");
    }
    if (item.v !== undefined && !Number.isFinite(item.v)) {
      fail(source, `${field}.v`, "a finite number");
    }
    if (item.u !== undefined && typeof item.u !== "string") {
      fail(source, `${field}.u`, "a string");
    }
    if (item.d !== undefined && typeof item.d !== "string") {
      fail(source, `${field}.d`, "a string");
    }
  }

  return value as InvoiceYAML;
};
