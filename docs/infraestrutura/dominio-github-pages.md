# Configuração do Domínio Próprio no GitHub Pages

**Projeto:** ContadJus

**Módulo:** LiquidaCalc

**Domínio:** contadjus.com.br

**Data da Implantação:** 02/08/2026

---

# Objetivo

Publicar o LiquidaCalc através de um domínio próprio, mantendo a hospedagem gratuita no GitHub Pages e utilizando o Supabase exclusivamente para autenticação e gerenciamento de usuários.

A arquitetura adotada elimina a necessidade de hospedagem tradicional ou servidor dedicado.

---

# Arquitetura da Solução

```
Usuário
    │
    ▼
https://contadjus.com.br
    │
    ▼
Registro.br (DNS)
    │
    ▼
GitHub Pages
    │
    ▼
Repositório GitHub (LiquidaCalc)
    │
    ▼
Supabase Auth
    │
    ▼
LiquidaCalc
```

---

# Componentes Utilizados

- Registro.br
- GitHub Pages
- Repositório GitHub
- Arquivo CNAME
- HTTPS automático (Let's Encrypt)
- Supabase Auth

---

# Etapa 1 — Registro do Domínio

Foi registrado o domínio:

```
contadjus.com.br
```

Após o registro, o domínio ainda não aponta para qualquer servidor.

Nesse momento ele apenas passa a existir dentro da infraestrutura do Registro.br.

---

# Etapa 2 — Publicação do Projeto

O LiquidaCalc foi publicado utilizando GitHub Pages.

Configuração utilizada:

```
Settings

↓

Pages

↓

Deploy from Branch

↓

Branch:
main

↓

Folder:
/
```

Após alguns minutos o GitHub disponibilizou o endereço temporário:

```
https://contadoriajefs.github.io/LiquidaCalc/
```

Este endereço continuará funcionando mesmo após a configuração do domínio próprio.

---

# Etapa 3 — Configuração do Domínio

No GitHub Pages foi informado:

```
Custom Domain

↓

contadjus.com.br
```

Inicialmente apareceu:

```
DNS check unsuccessful
```

Este comportamento é esperado.

O GitHub ainda não consegue localizar o domínio enquanto os registros DNS não forem configurados.

---

# Etapa 4 — Erro Encontrado

Durante a implantação foi identificado um erro importante.

O domínio foi inicialmente associado ao repositório incorreto.

Consequências:

- o GitHub criou o arquivo `CNAME` no projeto errado;
- o domínio permaneceu associado ao repositório incorreto;
- a validação do DNS nunca seria concluída.

Correção realizada:

- remoção do domínio do repositório incorreto;
- configuração do domínio no repositório oficial:

```
https://github.com/contadoriaJEFs/LiquidaCalc
```

Após essa alteração o GitHub recriou automaticamente o arquivo:

```
CNAME
```

na raiz do projeto.

Conteúdo:

```
contadjus.com.br
```

---

# Etapa 5 — Configuração do DNS

Foi utilizada a Zona DNS do Registro.br.

Importante:

A configuração NÃO é realizada em:

```
Alterar Servidores DNS
```

O local correto é:

```
Configurar Zona DNS
```

Foram criados os seguintes registros:

## Registros A

```
185.199.108.153

185.199.109.153

185.199.110.153

185.199.111.153
```

## Registro CNAME

Host:

```
www
```

Destino:

```
contadoriajefs.github.io
```

---

# Etapa 6 — Propagação DNS

Após salvar os registros, o Registro.br apresentou a mensagem:

```
Os servidores DNS do domínio se encontram em transição.
```

Esta mensagem significa apenas que:

- os registros foram aceitos;
- estão sendo propagados para a Internet.

Não representa erro.

---

# Tempo de Propagação

Na prática observou-se:

DNS interno:

5 minutos.

DNS público:

5 a 30 minutos.

Em algumas operadoras:

até 24 horas.

Durante esse período é normal ocorrer:

- domínio indisponível;
- domínio funcionando apenas para algumas pessoas;
- GitHub continuar informando erro de DNS.

---

# Etapa 7 — Validação do GitHub

Após a propagação, o GitHub passou a exibir:

```
DNS check successful
```

Essa mensagem confirma:

- domínio encontrado;
- registros corretos;
- GitHub validou a propriedade do domínio.

Este foi o marco que confirmou a conclusão da configuração DNS.

---

# Etapa 8 — Arquivo CNAME

Após a validação o GitHub criou automaticamente:

```
CNAME
```

na raiz do repositório.

Conteúdo:

```
contadjus.com.br
```

Este arquivo:

- identifica qual domínio pertence ao projeto;
- deve permanecer versionado;
- não deve ser removido.

Caso o domínio seja alterado, este arquivo será atualizado automaticamente pelo GitHub.

---

# Etapa 9 — HTTPS

Após validar o domínio, o GitHub iniciou automaticamente a emissão do certificado TLS.

Enquanto o certificado está sendo emitido:

```
Enforce HTTPS
```

permanece desabilitado.

Isso é esperado.

Somente após a emissão do certificado esta opção poderá ser habilitada.

Tempo observado:

5 a 30 minutos.

Em alguns casos:

até algumas horas.

---

# Testes Realizados

## GitHub Pages

✓ Projeto publicado.

✓ Deploy automático funcionando.

---

## Domínio

✓ Domínio reconhecido.

✓ DNS validado.

✓ Arquivo CNAME criado automaticamente.

---

## Autenticação

✓ Supabase funcionando.

✓ Login.

✓ Logout.

✓ Persistência de sessão.

✓ Recuperação de senha.

---

## LiquidaCalc

✓ Sistema carregando normalmente.

✓ Nenhuma alteração no motor de cálculos.

✓ Nenhuma alteração nas regras de negócio.

---

# Problemas Encontrados

## DNS check unsuccessful

Causa:

DNS ainda não propagado.

Solução:

Aguardar.

---

## ERR_TUNNEL_CONNECTION_FAILED

Causa observada:

Domínio ainda sem apontamentos DNS válidos.

Solução:

Configurar corretamente a Zona DNS.

---

## Domínio configurado no repositório errado

Causa:

Custom Domain informado no projeto incorreto.

Solução:

Remover o domínio do repositório incorreto.

Configurar novamente no repositório oficial.

---

## HTTPS indisponível

Causa:

Certificado TLS ainda não emitido.

Solução:

Aguardar a emissão automática pelo GitHub.

---

# Fluxo Completo

```
Registro.br

↓

Zona DNS

↓

Propagação

↓

GitHub Pages

↓

DNS check successful

↓

Arquivo CNAME

↓

Certificado HTTPS

↓

Supabase Auth

↓

LiquidaCalc

↓

Usuário autenticado
```

---

# Tempo Observado

Registro do domínio:

Imediato.

Configuração GitHub Pages:

2 minutos.

Configuração DNS:

5 minutos.

Propagação:

5 a 30 minutos.

Validação do GitHub:

alguns minutos após a propagação.

Certificado HTTPS:

5 a 30 minutos.

Tempo total esperado:

10 minutos a 1 hora.

Em situações excepcionais:

até 24 horas.

---

# Lições Aprendidas

- O domínio deve ser configurado no repositório correto antes da validação.
- O arquivo `CNAME` é criado automaticamente pelo GitHub.
- A configuração dos registros deve ser realizada na **Zona DNS** do Registro.br.
- A opção **Alterar Servidores DNS** não deve ser utilizada quando o Registro.br administra a zona DNS.
- O GitHub Pages utiliza quatro registros A para o domínio principal.
- O subdomínio `www` utiliza um registro CNAME apontando para `contadoriajefs.github.io`.
- A mensagem **DNS check successful** confirma que a configuração DNS foi concluída com sucesso.
- O HTTPS é emitido automaticamente após a validação do domínio.
- Não é necessário contratar hospedagem para utilizar um domínio próprio com GitHub Pages.

---

# Resultado Final

A infraestrutura inicial do ContadJus passou a ser composta por:

```
Usuário

↓

contadjus.com.br

↓

Registro.br

↓

GitHub Pages

↓

Repositório LiquidaCalc

↓

Supabase Auth

↓

LiquidaCalc
```

Com esta implantação, o ContadJus passou a possuir:

- domínio próprio;
- hospedagem gratuita;
- deploy automático;
- autenticação segura via Supabase;
- infraestrutura preparada para evolução da plataforma;
- independência de servidor próprio;
- compatibilidade integral com GitHub Pages.

Esta infraestrutura servirá como base para todos os futuros módulos da plataforma ContadJus.
