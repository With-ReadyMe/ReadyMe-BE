import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserInfoDto } from 'src/application/auth/dto/auth-info.dto';

@Injectable()
export class UserQuery {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findById(id).exec();
  }

  async createUser(createUserDto: User): Promise<UserDocument> {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async updateUserInfo(
    id: string,
    updateUserDto: UpdateUserInfoDto,
  ): Promise<void> {
    const updates: Record<string, unknown> = {};

    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updates[key] = value;
      }
    });

    if (updates.password !== undefined && updates.password !== null) {
      const salt = 10;
      updates.password = await bcrypt.hash(updates.password as string, salt);
    }

    await this.userModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .exec();
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { $unset: { refreshToken: 1 } })
      .exec();
  }

  async deleteUser(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
