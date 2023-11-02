CREATE EXTENSION pgcrypto;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS TRIGGER
     LANGUAGE plpgsql
     AS $$
DECLARE
     _new record;
BEGIN
     _new := NEW;
     _new."updated_at" = NOW();
     RETURN _new;
END;
$$;
