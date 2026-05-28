export class FleetManager {
  constructor({id, name, email, createdAt = new Date().toISOString(), updatedAt = createdAt}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      ...this.name.toJSON(),
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
