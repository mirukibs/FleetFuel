export const getParam = (request, key) => request?.params?.[key] ?? request?.body?.[key];

export const endpoint = ({method, path, description, requestSample, responseSample, successStatus = 200, handler}) => {
  return {
    method,
    path,
    description,
    requestSample,
    responseSample,
    onRequest: async (request, response) => {
      try {
        const result = await handler(request);
        return response.status(successStatus).json(result);
      } catch (error) {
        return response.status(error.statusCode ?? 500).json({
          error: error.name ?? 'Error',
          message: error.message ?? 'Unexpected error'
        });
      }
    }
  };
};
