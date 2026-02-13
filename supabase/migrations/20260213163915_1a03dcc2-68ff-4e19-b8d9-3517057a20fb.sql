-- Move pg_trgm extension to a dedicated schema to avoid public schema warning
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;