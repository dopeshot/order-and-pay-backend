import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, Provider, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import * as bcyrpt from 'bcrypt'
import { userDataFromProvider } from './interfaces/userDataFromProvider.interface';
import { Status } from './enums/status.enum';
import { MailService } from '../mail/mail.service';
import { VerifyDocument } from './entities/verify.entity';
import * as crypto from 'crypto'
import { JwtService } from '@nestjs/jwt';
import { MailVerifyDto } from 'src/mail/dto/mail-verify.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userSchema: Model<UserDocument>,
    @InjectModel('Reset') private resetSchema: Model<VerifyDocument>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService) { }

  /**
   * Create new user with credentials
   * @param credentials of the user
   * @returns User
   */
  async create(credentials: CreateUserDto): Promise<User> {
    try {
      const hash = await bcyrpt.hash(credentials.password, 12)
      const user = new this.userSchema({
        ...credentials,
        status: Status.Unverified,
        password: hash
      })

      await this.createVerification(user)

      const result = await user.save()

      return result
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.username)
        throw new ConflictException('Username is already taken.')
      else if (error.code === 11000 && error.keyPattern.email)
        throw new ConflictException('Email is already taken.')
      else if (error instanceof ServiceUnavailableException )
        throw error
      throw new InternalServerErrorException("User Create failed")

    }
  }

  async parseJWTtOUsable(JWTuser): Promise<UserDocument> {
    const user = await this.userSchema.findById(JWTuser.userId)

    if (!user) {
      throw new NotFoundException()
    }

    return user
  }

  async createVerification(user: User) {
    const payload = {
      mail: user.email,
      name: user.username,
      id: user._id,
      create_time: Date.now()
  }

  let verifyCode =  this.jwtService.sign(payload)

  console.log( `${process.env.HOST}/user/verify/?code=${verifyCode}`)

  await this.mailService.sendMail( user.email, 'MailVerify', {name: user.username, link: `${process.env.HOST}/user/verify/?code=${verifyCode}`} as MailVerifyDto, 'Verify your email')
  }

  /**
   * Create new User for auth without password
   * @param credentials user data
   * @returns user
   */
  async createUserFromProvider(userDataFromProvider: userDataFromProvider): Promise<User> {
    try {
      const user: UserDocument = new this.userSchema(userDataFromProvider)
      const result = await user.save()

      return result
    } catch (error) {
      throw new InternalServerErrorException('Error occured while saving user from provider.')
    }
  }

  /**
   * Find all user
   * @returns Array aus allen User 
   */
  async findAll(): Promise<User[]> {
    return await this.userSchema.find()
  }

  /**
   * Find user by id
   * @param id of the user
   * @returns User
   */
  async findOneById(id: ObjectId): Promise<User> {
    const user = await this.userSchema.findById(id).lean()

    if (!user)
      throw new NotFoundException()

    return user
  }

  /**
   * Find user by username
   * @param username of the user
   * @returns User
   */
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userSchema.findOne({ username }).lean()

    if (!user)
      throw new NotFoundException()

    return user
  }

  /**
   * Find user by email
   * @param email of the user
   * @returns User
   */
  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userSchema.findOne({ email }).lean()

    if (!user)
      return null

    return user
  }

  /**
   * FOR TESTING update role - do not use in deployment (or disable endpoint)
   * @param id object id
   * @param role 
   * @returns User
   */
  async patchRole(id: ObjectId, role: any): Promise<User> {
    try {
      const updatedUser: User = await this.userSchema.findByIdAndUpdate(id, {
        role: role.role
      }, {
        new: true
      })

      return updatedUser
    } catch (error) {
      throw new InternalServerErrorException("Update Role failed")
    }
  }

  /**
   * Update the user
   * @param id ObjectId
   * @param updateUserDto Dto for updates 
   * @returns updated user (with changed fields)
   */
  async updateUser(id: ObjectId, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updatedUser: User = await this.userSchema.findByIdAndUpdate(id, {
        ...updateUserDto
      }, {
        new: true
      })

      return updatedUser
    } catch (error) {
      if (error.code === 11000)
        throw new ConflictException('Username is already taken.')
      else
        throw new InternalServerErrorException("Update User failed")
    }
  }


  /**
   * Remove User by Id
   * @param id User id
   * @returns Removed User
   */
  async remove(id: ObjectId): Promise<User> {
    const user = await this.userSchema.findByIdAndDelete(id)

    if (!user)
      throw new NotFoundException()

    return user
  }

  async validateVerifyCode(userId: ObjectId): Promise<boolean> {
    let user: User
    try {
        user = await this.findOneById(userId)
    } catch (error) {
        // This is necessary as a not found exception would overwrite the guard response
        return false
    }
    if (!user) return false // This should never happen but just in case    
    if (user.status !== Status.Unverified){
        return false
    }
    return true
  }
  /**
   * Verify a user and set the status of said user to active.
   * @param code - email validation code
   * @returns the updated user object
   */

  async veryfiyUser(userId:ObjectId):Promise<UserDocument> {

    const user = await this.userSchema.findByIdAndUpdate(userId, {status: Status.Active})

    if (!user) {
      throw new NotFoundException()
    }
    return user
  }
}
