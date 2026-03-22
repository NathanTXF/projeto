# Projeto

Este é o início do projeto.

## Acesso ao banco via navegador (pgAdmin)

O ambiente Docker agora inclui o pgAdmin, e o sistema principal roda com HTTPS local via Nginx.

O pgAdmin esta configurado para operar atras de reverse proxy HTTPS (cabecalhos X-Forwarded).
Para o ambiente local, a validacao CSRF do pgAdmin foi flexibilizada para evitar erro de carregamento de preferencias no navegador.

1. Suba os serviços:
	- docker compose up -d --build
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
