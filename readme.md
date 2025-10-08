# Aplicação que fará o processamento de um novo parceiro.

### Estrutura do repositório

- files/upload: Local onde deve estar os arquivos que serão utilados na interface e que serão enviados para o S3, como logo, favicon, hero-image e icons.
- builds: Onde estará os arquivos buildados que já foram processados e enviados para o S3, e que foram buildados mas ainda não foram para o S3.
- templates: Onde estará os arquivos de template das páginas.
- lib: Código de processamento.

### Passos de execução

- Inserir os arquivos de icons e images na pasta lib/setup/files
- Inserir os dados da empresa e do usuário no arquivo lib/setup/config.current.js
- Rodar o script process