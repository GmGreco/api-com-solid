export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}
export class User {
  constructor(
    private _id: string,
    private _email: string,
    private _password: string,
    private _name: string,
    private _role: UserRole = UserRole.CUSTOMER,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {
    this.validateUser();
  }
  private validateUser(): void {
    if (!this._email || !this._email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (!this._name || this._name.trim().length < 2) {
      throw new Error("Name must have at least 2 characters");
    }
    if (!this._password || this._password.length < 6) {
      throw new Error("Password must have at least 6 characters");
    }
  }
  get id(): string {
    return this._id;
  }
  get email(): string {
    return this._email;
  }
  get password(): string {
    return this._password;
  }
  get name(): string {
    return this._name;
  }
  get role(): UserRole {
    return this._role;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  public isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }
  public updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error("Name must have at least 2 characters");
    }
    this._name = newName;
    this._updatedAt = new Date();
  }
  public updateEmail(newEmail: string): void {
    if (!newEmail || !newEmail.includes("@")) {
      throw new Error("Invalid email format");
    }
    this._email = newEmail;
    this._updatedAt = new Date();
  }
  public updatePassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must have at least 6 characters");
    }
    this._password = newPassword;
    this._updatedAt = new Date();
  }
  public toJSON() {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
