# Lil' Invoicer

Lil' invoicer is a command line tool for creating invoices. It generates high-quality PDFs from simple yaml files, using a html template with [handlebars](https://github.com/handlebars-lang/handlebars.js) and rendering the PDF with [puppeteer](https://github.com/puppeteer/puppeteer).

## Installation 

Clone and run `npm install && npm link`.

Run `invoice init` and fill in your config.

## Usage

```
$ invoice help
Usage: invoice [options] [command]

Littlest invoice tool for the command line.

Options:
  -V, --version                       output the version number
  -h, --help                          display help for command

Commands:
  generate [options] [invoiceIds...]  generate PDFs from invoice yaml files
  new                                 create new invoice data file
  list                                list invoices comma-separated with some useful data
  clients [options]                   list clients
  help [command]                      display help for command
```

## First time use & config
```
$ invoice init
✨ Config created! /path/to/invoicer/config/config.yml
```

`config/config.yml`
```yaml
invoice:                    
  template: invoice.html    # File to use as template, so you can use your own
  prefix: Invoice_          # Prefix of generated PDFs, followed by the invoice number
  defaultVat: 0.21          # Will apply to any item where no vat is given
  defaultCurrency: EUR      # Three-letter currency code (see src/currencies.json)
  locale: en-GB             # Applies to date and number formatting on the invoice
  paymentTerm: 14           # In days
  outDir:                   # Absolute path where generated PDFs go. If empty the local
                            # folder ./generated will be used

company:                    # Your commany info
  name:                     
  address:
  zipcode:
  city:
  vatId:                      
  coc:
  accountHolder:
  iban:
  phone:
  email:

clients:                    # Your client list
  - id: 1
    company:
    contact:
    adress:
    zipcode:
    city:
    country:
    vatId:

  - id: 2
    company:
    contact:
    adress:
    zipcode:
    city:
    country:
    vatId:
```

All this data can be accessed in the html template i.e. by using `{{config.invoice.paymentTerm}}` so it's possible to add custom variables here. 

## Creating invoices 

### Generate new invoice data file
```
$ invoice new
✨ New invoice created! /path/to/invoicer/invoices/1.yml
```

The filename will be the invoice number. To start at another number change the filename accordingly. `invoice new` will automatically increment from the highest invoice number it can find. 

### Fill in the data
`invoices/1.yml`
```yaml
to: 
date: 2030-01-26  

# Use t for title, p for price, a for amount (optional, default 1), u for unit (optional), d for description (optional), v for vat (optional)
items:
  - t: 
    p: 

# Optional
currency: EUR
```

- `to` must be set to the client's id from the config file. 
- `date` will be filled automatically with today's date.
- `items` is a list/array of products for the invoice. Only `t` and `p` are required per item.
  - `t` title (required)
  - `p` price (required)
  - `a` amount (optional, default 1), total of this item will be `price` * `amount`
  - `u` unit (optional, default empty), for example `hours` or `pieces`. 
  - `d` description (optional, default empty), will be rendered below the title. in smaller font. Use `|` for multiline.
  - `v` vat (optional, default `invoice.defaultVat` from config), can be any other percentage, to allow for different vat percentages on one invoice.
- `currency` (optional) can be used to set this invoice to another currency than your default currency in config.

#### Optional config

- `currency` can be set to another currency with the three letter currency code.

### Generate PDF
```
$ invoice generate
✨ Invoice_1.pdf generated!
Done!
```