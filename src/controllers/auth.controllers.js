import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createError from "http-errors";

// ======================= REGISTER ======================= 
// Register เมื่อ user กรอก username, email และ password จาก frontend ระบบจะรับค่าผ่าน req.body แล้วใช้ destructuring เพื่อดึงค่าออกมาใช้งาน

export const registerController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body; //ดึงค่าที่ user กรอกมา 

    // validate ตรวจสอบว่ากรอกครบไหม
    if (!username || !email || !password) {
      
      throw createError(400, "Please fill all fields");
    }
      // ทำให้ email clean
    const normalizedEmail = email.toLowerCase().trim();

    // เช็คใน database ด้วย Prisma ว่ามี email นี้อยู่แล้วหรือไม่ ถ้ามี → จะไม่ให้สมัครซ้ำ 
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw createError(400, "Email already exists");
    }

    //ตรวจสอบความยาว password เพื่อ security policy
    if (password.length < 6) {
      throw createError(400, "Password must be at least 6 characters");
    }

    // hash password ด้วย  bcrypt ก่อนเก็บลง database 
    const hashPassword = await bcrypt.hash(password, 10);

    // create user คล้ายกันในช่วงแรกครับ คือรับ email กับ password และ validate ข้อมูลก่อน
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: normalizedEmail,
        password: hashPassword,
        role: "USER",
      },
    });

    return res.status(201).json({
      message: "Register Success 🎉",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    next(error);
  }
};

// ======================= LOGIN ======================= Login flow จะคล้ายกันในช่วงแรกครับ คือรับ email กับ password และ validate ข้อมูลก่อน

export const loginController = async (req, res, next) => {
  try {


    const { email, password } = req.body;
    
        // console.log(req.body.email)
        // console.log(req.body.password) 

    if (!email || !password) {
      return next(createError(400, "Please fill all fields"));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return next(createError(401, "Invalid credentials"));
    }

    // ถ้าพบ user แล้ว จะใช้ bcrypt.compare เพื่อตรวจสอบว่า password ที่กรอกตรงกับ hash ใน database หรือไม่
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createError(401, "Invalid credentials"));
    }
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    // 🔐 JWT TOKEN ถ้าถูกต้อง ระบบจะสร้าง JWT token โดยใส่ข้อมูลสำคัญ เช่น user id, username และ role ลงไปใน token
    //token นี้จะถูกใช้แทน session เพื่อให้ user สามารถเข้าถึง API อื่น ๆ ได้โดยไม่ต้อง login ใหม่ทุกครั้ง
    const token = jwt.sign(
     payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login Success 🎉",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    next(error);
  }
};
