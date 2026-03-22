# Projeto

Este é o início do projeto.

## Inicialização rápida do ambiente

Para evitar rebuild completo toda vez no início do trabalho, use o script de bootstrap:

1. Deixe o script executável (apenas na primeira vez):
	- chmod +x scripts/start-work.sh
2. Inicie o ambiente (modo inteligente, com rebuild apenas quando necessário):
	- ./scripts/start-work.sh

Comandos úteis:
- Forçar rebuild completo das imagens da aplicação e nginx:
	- ./scripts/start-work.sh rebuild
- Ver status dos containers:
	- ./scripts/start-work.sh status
- Parar containers (mantém rede/volumes):
	- ./scripts/start-work.sh stop
- Derrubar ambiente (remove containers/rede):
	- ./scripts/start-work.sh down

Atalhos via npm:
- npm run work:start
- npm run work:rebuild
- npm run work:stop
- npm run work:down

## Acesso ao banco via navegador (pgAdmin)

O ambiente Docker agora inclui o pgAdmin, e o sistema principal roda com HTTPS local via Nginx.

O pgAdmin esta configurado para operar atras de reverse proxy HTTPS (cabecalhos X-Forwarded).
Para o ambiente local, a validacao CSRF do pgAdmin foi flexibilizada para evitar erro de carregamento de preferencias no navegador.

1. Suba os serviços:
	- ./scripts/start-work.sh
2. Acesse no navegador (HTTPS):
	- Sistema: https://localhost
	- pgAdmin: https://localhost:5443
3. Faça login no pgAdmin com:
	- Email: admin@dinheirofacil.com
	- Senha: admin

Na primeira abertura, o navegador exibira aviso de certificado local autoassinado. Aceite a excecao de seguranca para continuar.

O servidor PostgreSQL já é registrado automaticamente como Dinheiro Facil Postgres.

Se o pgAdmin pedir a senha da conexão, use a senha do banco definida no compose:
- Usuário: admin
- Senha: admin
