import { randomBytes } from 'node:crypto';
import { User } from '../../Domain/entities/User.mjs';
import { AuthenticationError, ConflictError, ValidationError } from '../../Domain/errors.mjs';

export class AuthenticationApplicationService {
  constructor({ userRepo, sessionRepo, passwordHasher }) {
    this.userRepo = userRepo;
    this.sessionRepo = sessionRepo;
    this.passwordHasher = passwordHasher;
  }

  createUser(input) {
    if (!input?.password) throw new ValidationError('Password is required');

    const email = String(input.email ?? '').trim().toLowerCase();
    if (this.userRepo.findByEmail(email)) {
      throw new ConflictError(`User with email ${email} already exists.`);
    }

    const user = new User({
      id: input.id,
      email,
      passwordHash: this.passwordHasher.hash(input.password),
      role: input.role,
      affiliatedServiceId: input.affiliatedServiceId
    });

    this.userRepo.save(user);
    return user.toJSON();
  }

  login(input) {
    const email = String(input?.email ?? '').trim().toLowerCase();
    const user = this.userRepo.findByEmail(email);

    if (!user || !this.passwordHasher.verify(input?.password, user.passwordHash)) {
      throw new AuthenticationError('Invalid email or password');
    }

    const session = {
      token: randomBytes(32).toString('hex'),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    this.sessionRepo.save(session);

    return {
      token: session.token,
      user: user.toJSON()
    };
  }

  getSession(token) {
    if (!token) throw new AuthenticationError();

    const session = this.sessionRepo.findByToken(token);
    if (!session) throw new AuthenticationError('Session expired or invalid');

    const user = this.userRepo.findById(session.userId);
    if (!user) throw new AuthenticationError('Session user no longer exists');

    return {
      user: user.toJSON()
    };
  }

  logout(token) {
    if (!token) throw new AuthenticationError();
    this.sessionRepo.deleteByToken(token);
    return { loggedOut: true };
  }
}
