#!/bin/sh
set -e

# Execute pdflatex with passed arguments
exec pdflatex "$@"
