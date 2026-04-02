const isTest = process.env.NODE_ENV === 'test';

const JWT_SECRET = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

export { JWT_SECRET };

