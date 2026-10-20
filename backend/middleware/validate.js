/**
 * Validation d'une entrée (body, query ou params) avec un schéma zod.
 * Remplace la valeur par la donnée validée et normalisée.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.length ? issue.path.join('.') : source,
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Les données envoyées sont invalides.',
        details,
      });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
