export async function resolve(specifier, context, defaultResolve) {
  const result = await defaultResolve(specifier, context, defaultResolve);
  if (result.url.endsWith('.jcm')) {
    return {
      url: result.url,
      format: 'module',
      shortCircuit: true
    };
  }
  return result;
}
