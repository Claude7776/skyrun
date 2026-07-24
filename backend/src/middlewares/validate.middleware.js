import { ApiError } from '../utils/ApiError.js';

/**
 * Generic request validator driven by Zod schemas.
 * Usage: validate({ body: registerSchema }) as a route middleware.
 * On success, replaces req.body/query/params with the parsed (and
 * type-coerced) values so downstream code can trust their shape.
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (error) {
      const details = error.errors?.map((e) => `${e.path.join('.')}: ${e.message}`) ?? [error.message];
      next(ApiError.badRequest('Validation failed', details));
    }
  };
}
