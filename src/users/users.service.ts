import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<void> {

        
        const userExists = await this.getByEmail(createUserDto.email);
        if (userExists) throw new Error('User already exists.');

        const userCreated = new this.userModel(createUserDto);
        await userCreated.save();
    }

    async getByEmail(email: string): Promise<User> {
        return this.userModel.findOne({ email });
    }
}
