## Migrações (Supabase)

Este projeto mantém migrações SQL em `app/supabase/migrations/`.

### Como aplicar

- **Projeto novo**: execute `app/supabase/schema.sql` no SQL Editor do Supabase.
- **Projeto existente**: aplique as migrações em ordem (por nome/tempo) no SQL Editor.

### Migrações disponíveis

- `20260107_01_add_cycles_before_long_break.sql`: adiciona `cycles_before_long_break` em `user_settings`.

