import {ValidationError} from '../errors.mjs';

export class Name {
  constructor(firstName, lastName) {
    if (!firstName || !lastName) {
      throw new ValidationError('First name and last name are required.');
    }
    this.firstName = `${firstName}`.trim();
    this.lastName = `${lastName}`.trim();
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName()
    };
  }
}
