# Sistema de Autenticação

## Objetivo

Proteger o LiquidaCalc durante a fase de desenvolvimento.

## Tecnologia

- Supabase Auth
- GitHub Pages

## Componentes

auth.js

supabase.js

auth.css

## Fluxo

Usuário

↓

Login

↓

Supabase

↓

Sessão válida

↓

LiquidaCalc

## Decisões

- Não alterar o motor de cálculos.
- Utilizar overlay.
- Sessão persistente.
- Logout.
- Recuperação de senha.

## Melhorias realizadas

- Correção do namespace CONTADJUS.
- Tradução das mensagens de erro.
- Uso de finally.
- Uso de Optional Chaining.
- Padronização dos logs.
