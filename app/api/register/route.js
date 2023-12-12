import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function POST(request) {
  const body = await request.json();
  const { email, password } = body;
  console.log(body);

  // if(user && await bcrypt.compare(password,user.password)){
  //     return NextResponse.redirect('/dashboard')
  // }else{
  //     return NextResponse.redirect('/login')
  // }

  if (!email || !password) {
    return NextResponse({
      status: 400,
      body: { message: "email and password are required" },
    });
  }

  const exist = await prisma.user.findUnique({
    where: {
      email:email
    },
  });

  if (exist) {
    return NextResponse({
      status: 400,
      body: { message: "email already exist" },
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword,
    },
  });

    return NextResponse.json(user);
}
