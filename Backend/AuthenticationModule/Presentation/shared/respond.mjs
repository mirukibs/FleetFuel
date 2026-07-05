export const getBearerToken = (request) => {
  const header = request?.headers?.authorization ?? request?.headers?.Authorization ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1] ?? null;
};

export const endpoint = ({ method, path, description, requestSample, responseSample, successStatus = 200, handler }) => {
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
