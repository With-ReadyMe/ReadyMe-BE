import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  })
  sex: string;

  @Prop({ required: true })
  birth: Date;

  @Prop({ required: true })
  address: string;

  @Prop({ required: false })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
