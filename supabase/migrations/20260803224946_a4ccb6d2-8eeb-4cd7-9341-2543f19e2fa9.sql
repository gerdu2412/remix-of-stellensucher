DO $mig$
DECLARE src text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO src
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';

  IF src IS NULL THEN
    RAISE EXCEPTION 'handle_new_user not found';
  END IF;

  src := replace(src, 'RETURNING id INTO j1;', ';');
  EXECUTE src;
END
$mig$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;