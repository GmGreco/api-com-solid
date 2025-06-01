import User from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import UserModel from "../database/mongodb/schemas/UserSchema";

class MongoDBUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return new User({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;

    return new User({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async save(user: User): Promise<User> {
    const newUser = await UserModel.create({
      _id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    return new User({
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    });
  }

  async update(user: User): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      {
        name: user.name,
        email: user.email,
        password: user.password,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return new User({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      password: updatedUser.password,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();

    return users.map(
      (user) =>
        new User({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          password: user.password,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
    );
  }
}

export default MongoDBUserRepository;
