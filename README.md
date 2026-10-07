# PinBrasil V3 🇧🇷

Versão 3 com Next.js + Supabase.

## Configuração
Crie um projeto no Supabase, execute `supabase/schema.sql` no SQL Editor e configure:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

Depois:
npm install
npm run dev

A V3 já possui a interface e integração para autenticação, pins e curtidas persistentes. Comentários, seguidores, coleções e notificações estão modelados no banco para a próxima etapa.
