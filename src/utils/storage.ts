import crypto from "crypto";
import path from "path";
import { supabase } from "../lib/supabase.js";

const bucket = process.env.SUPABASE_BUCKET ?? "files";

async function uploadFile(userId: number, file: Express.Multer.File): Promise<string> {
    const extension = path.extname(file.originalname || "");
    
    const storagePath = `${userId}/${crypto.randomUUID()}${extension}`;
    

    if (!file.buffer) {
        throw new Error("Missing file buffer for upload.");
    }

    const { error } = await supabase.storage.from(bucket).upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
    });

    if (error) {
        throw new Error(error.message);
    }

    return storagePath;
}

async function deleteFile(storagePath: string) {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);

    if (error) {
        throw error;
    }
}

async function getSignedUrl(
    storagePath: string,
    expiresInSeconds = 60,
    downloadFileName?: string
): Promise<string> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresInSeconds, {
            download: downloadFileName ?? true,
        });

    if (error || !data) {
        throw error ?? new Error("Failed to create signed URL.");
    }

    return data.signedUrl;
}

export { uploadFile, deleteFile, getSignedUrl };
