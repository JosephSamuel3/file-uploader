import { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import passport from "passport";
import { prisma } from "../lib/prisma";

const getLogin = (req: Request, res: Response) => {
  res.render("login", {
    title: "Login",
    errors: [],
  });
};

const getSignUp = (req: Request, res: Response) => {
  res.render("signup", {
    title: "Signup",
    errors: [],
  });
};

async function postSignUp(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("signup", {
      title: "Signup",
      errors: errors.array(),
    });
  }

  try {
    const { email, firstName, lastName, username, password } = matchedData(req);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        username,
        password: hashedPassword,
      },
    });

    res.redirect("/login");
  } catch (err) {
    next(err);
  }
}

const postLogin = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
});

export { getLogin, getSignUp, postSignUp, postLogin };
