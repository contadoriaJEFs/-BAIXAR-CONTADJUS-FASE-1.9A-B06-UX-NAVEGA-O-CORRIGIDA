# Decisões Arquiteturais

## DA-001

Data: 02/08/2026

### Decisão

A autenticação será realizada utilizando Supabase Auth.

### Motivo

Evitar desenvolvimento de autenticação própria.

### Impacto

- GitHub Pages permanece gratuito.
- Não existe backend próprio.
- Sessões persistentes.
- Login seguro.

---

## DA-002

Todo cálculo permanecerá sendo executado no navegador.

### Motivo

- Performance.
- Independência do servidor.
- Transparência.
- Compatibilidade com GitHub Pages.

---

## DA-003

O Supabase nunca executará cálculos.

Será utilizado apenas para:

- Login.
- Usuários.
- Banco PostgreSQL.
- Armazenamento.

---

## DA-004

Não utilizar frameworks JavaScript.

Motivos:

- Simplicidade.
- Controle do código.
- Facilidade de manutenção.
- Compatibilidade com GitHub Pages.

---

## DA-005

LiquidaCalc será o primeiro módulo da plataforma ContadJus.
