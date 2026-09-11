FROM debian:bookworm-slim

# Prevent interactive prompts during apt install
ENV DEBIAN_FRONTEND=noninteractive

# Install pdfLaTeX and required packages for ResumeForge compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-pictures \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged user for secure container execution
RUN groupadd -g 1000 latexuser && \
    useradd -u 1000 -g latexuser -m latexuser

# Create workspace directory
WORKDIR /workspace
RUN chown -R latexuser:latexuser /workspace

# Copy entrypoint script
COPY compile.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown latexuser:latexuser /entrypoint.sh

USER latexuser:latexuser

ENTRYPOINT ["/entrypoint.sh"]
