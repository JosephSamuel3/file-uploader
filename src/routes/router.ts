import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { nameValidator, signUpValidator } from "../validators/nameValidator";
import { validateFile } from "../validators/validateFile";
import * as indexController from "../controllers/indexController";
import * as authController from "../controllers/authController";
import * as fileController from "../controllers/fileController";
import * as folderController from "../controllers/folderController";
import * as shareController from "../controllers/shareController";

const router = express.Router();

//landing page
router.get("/", indexController.getIndex);

//Auth
router.get("/signup", authController.getSignUp);
router.post("/signup", signUpValidator, authController.postSignUp);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.getLogOut);

//home page after authenticated
router.get("/dashboard", isAuthenticated, indexController.getDashBoard);
router.get("/dashboard/:folderId", isAuthenticated, indexController.getDashBoard);

//folders
router.post("/folders", isAuthenticated, nameValidator, folderController.postCreateFolder);
router.post("/folders/:id/rename", isAuthenticated, nameValidator, folderController.postRenameFolder);
router.post("/folders/:id/delete", isAuthenticated, folderController.postDeleteFolder);

//share
router.post("/folders/:id/share", isAuthenticated, shareController.postCreateShare);
router.get("/share/:token", shareController.getSharedFolder);
router.get("/share/:token/files/:fileId/download", shareController.getSharedFileDownload);

//files
router.post("/files", isAuthenticated, upload.single("file"), validateFile, fileController.postUploadFile);
router.get("/files/:id/detail", isAuthenticated, fileController.getFileDetail)
router.get("/files/:id/download", isAuthenticated, fileController.getDownloadFile);
router.post("/files/:id/rename", isAuthenticated, nameValidator, fileController.postRenameFile);
router.post("/files/:id/delete", isAuthenticated, fileController.postDeleteFile);

export { router };
