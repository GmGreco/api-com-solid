import { v4 as uuidv4 } from "uuid";

interface UserProps {
  name: string;
  email: string;
  password: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class User {
  public readonly id: string;
  public name: string;
  public email: string;
  public password: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: UserProps) {
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.id = props.id ?? uuidv4();
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}

export default User;
