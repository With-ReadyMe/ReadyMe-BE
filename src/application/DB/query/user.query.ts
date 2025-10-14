import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';

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

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { refreshToken }).exec();
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(id, { $unset: { refreshToken: 1 } })
      .exec();
  }
}
