export const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = "Request successful",
    data = null,
    meta = null,
  } = {}
) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res,
  {
    statusCode = 500,
    message = "Something went wrong",
    errors = [],
  } = {}
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};