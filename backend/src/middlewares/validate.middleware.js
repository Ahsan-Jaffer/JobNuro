import AppError from "../utils/AppError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));

      return next(new AppError("Validation failed", 400, errors));
    }

    if (result.data.body) {
      req.body = result.data.body;
    }

    if (result.data.params) {
      req.params = result.data.params;
    }

    /*
      Do not assign req.query directly.
      In some Express versions, req.query is read-only.
      If validated query data is needed, use req.validatedQuery.
    */
    if (result.data.query) {
      req.validatedQuery = result.data.query;
    }

    next();
  };
};