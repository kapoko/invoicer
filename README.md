# Lil' Invoicer

Lil' invoicer is a command line tool for creating invoices. It generates high-quality PDFs from simple yaml files, using a html template with [handlebars](https://github.com/handlebars-lang/handlebars.js) and rendering the PDF with [puppeteer](https://github.com/puppeteer/puppeteer).

## Installation 

Run `npm install && npm link`.

Run `cp config/config.example.yml config/config.yml` and fill in your config.

List commands with `invoice help`. If permission is denied run `chmod +x dist/index.js`

## Usage

```
~ ❯ invoice help
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