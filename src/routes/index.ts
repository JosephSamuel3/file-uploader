import { Router } from "express";
import passport from "passport";
import { isGuest } from "../middleware/auth";
import * as indexController from "../controllers/indexController";

const router = Router();

router.get("/", indexController.getIndex);

router.get("/login", isGuest, indexController.getLogin);
router.post(
  "/login",
  isGuest,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
