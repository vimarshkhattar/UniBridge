/**
 * The Groq model both AI routes use.
 *
 * Kept in one place because it drifted out of date in two files at once: the
 * previous model (`llama-3.1-8b-instant`) was decommissioned by Groq, every
 * request came back `model_not_found`, and both routes silently served their
 * canned fallback text instead.
 *
 * If answers ever go back to being identical, check this first:
 *   curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"
 */
export const GROQ_MODEL = "openai/gpt-oss-20b";
