import assert from 'node:assert/strict';
import test from 'node:test';
import { createUser } from '../AuthenticationModule/Presentation/controllers/createUser.mjs';
import { login } from '../AuthenticationModule/Presentation/controllers/login.mjs';
import { logout } from '../AuthenticationModule/Presentation/controllers/logout.mjs';
import { getSession } from '../AuthenticationModule/Presentation/controllers/getSession.mjs';
import { resetInMemoryDatabase } from '../AuthenticationModule/Infrastructure/database/inMemoryDatabase.mjs';

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    }
  };
  return response;
};

const invoke = async (endpoint, { body = {}, headers = {} } = {}) => {
  const response = createResponse();
  await endpoint.onRequest({ body, headers }, response);
  return response;
};

test('users can be created, log in, read their role session, and log out', async () => {
  resetInMemoryDatabase();

  const created = await invoke(createUser, {
    body: {
      email: 'buyer@example.com',
      password: 'secret-123',
      role: 'fleet_company',
      affiliatedServiceId: 'fc-001'
    }
  });

  assert.equal(created.statusCode, 201);
  assert.equal(created.body.email, 'buyer@example.com');
  assert.equal(created.body.role, 'fleet_company');
  assert.equal(created.body.affiliatedServiceId, 'fc-001');
  assert.equal(created.body.passwordHash, undefined);

  const session = await invoke(login, {
    body: {
      email: 'buyer@example.com',
      password: 'secret-123'
    }
  });

  assert.equal(session.statusCode, 200);
  assert.match(session.body.token, /^[a-f0-9]{64}$/);
  assert.equal(session.body.user.email, 'buyer@example.com');
  assert.equal(session.body.user.role, 'fleet_company');

  const current = await invoke(getSession, {
    headers: {
      authorization: `Bearer ${session.body.token}`
    }
  });

  assert.equal(current.statusCode, 200);
  assert.equal(current.body.user.affiliatedServiceId, 'fc-001');

  const loggedOut = await invoke(logout, {
    headers: {
      authorization: `Bearer ${session.body.token}`
    }
  });

  assert.equal(loggedOut.statusCode, 200);
  assert.equal(loggedOut.body.loggedOut, true);

  const expired = await invoke(getSession, {
    headers: {
      authorization: `Bearer ${session.body.token}`
    }
  });

  assert.equal(expired.statusCode, 401);
  assert.equal(expired.body.error, 'AuthenticationError');
});

test('authentication rejects duplicate emails, invalid roles, and bad credentials', async () => {
  resetInMemoryDatabase();

  const supplier = await invoke(createUser, {
    body: {
      email: 'supplier@example.com',
      password: 'secret-123',
      role: 'fuel_supplier',
      affiliatedServiceId: 'supplier-001'
    }
  });
  assert.equal(supplier.statusCode, 201);

  const duplicate = await invoke(createUser, {
    body: {
      email: 'supplier@example.com',
      password: 'secret-123',
      role: 'fuel_supplier',
      affiliatedServiceId: 'supplier-002'
    }
  });
  assert.equal(duplicate.statusCode, 409);
  assert.equal(duplicate.body.error, 'ConflictError');

  const invalidRole = await invoke(createUser, {
    body: {
      email: 'admin@example.com',
      password: 'secret-123',
      role: 'admin',
      affiliatedServiceId: 'admin-001'
    }
  });
  assert.equal(invalidRole.statusCode, 400);
  assert.equal(invalidRole.body.error, 'ValidationError');

  const badLogin = await invoke(login, {
    body: {
      email: 'supplier@example.com',
      password: 'wrong-password'
    }
  });
  assert.equal(badLogin.statusCode, 401);
  assert.equal(badLogin.body.error, 'AuthenticationError');
});
