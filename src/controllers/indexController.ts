import { Request, Response } from "express";

export const getIndex = (req: Request, res: Response) => {
  res.render("index", {
    title: "Home",
    user: req.user || null,
  });
};

export const getLogin = (req: Request, res: Response) => {
  res.render("login", {
    title: "Login",
    errors: [],
  });
};
