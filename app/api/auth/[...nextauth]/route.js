import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(Prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        //check to see if email and password  is valid
        if (!credentials.email || !credentials.password) {
            return null;
          
        } 
        //check to see if email exist
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          return null;
        }
        //check to see if password match
        const passwordsMatch = await bcrypt.compare(credentials.password, user.hashedPassword);

        if (!passwordsMatch) {
          return null;
        }

        //return user;
        // Assign a default role to the user (e.g., "student") - you can modify this logic
        let role = "admin"; // Change this logic as per your requirement

        if (user.isAdmin) {
          role = "admin";
        } else if (user.isTeacher) {
          role = "teacher";
        }

        // Update the user's role in the database
        const updatedUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            role, // Assigning the role to the user
          },
        });

        console.log("User Role:", updatedUser.role); // Log the role to the console

       // return updatedUser;

       return { ...updatedUser, role }; 
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if(user) token.role = user.role
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
