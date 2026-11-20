-- ============================================================================
-- Supabase Storage — bucket privado de vídeos do Invest Fácil
-- Execute no SQL Editor do projeto Supabase, com a service role.
-- O bucket NÃO é público. O backend gera URLs assinadas de curta duração.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', false, 157286400, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Nenhuma policy para anon/authenticated: o acesso é exclusivamente pelo
-- backend usando a service role key (nunca exposta no frontend).
-- Não crie policies públicas para este bucket.
