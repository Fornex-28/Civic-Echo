import { supabase } from "@/lib/supabase";

/**
 * Upload an image file to Supabase Storage.
 * Falls back to base64 data URL if storage is not configured.
 */
export async function uploadImage(file: File): Promise<string> {
    try {
        // Check if Supabase is properly configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL" || !supabaseUrl.startsWith("http")) {
            return fileToBase64(file);
        }

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `reports/${fileName}`;

        const { error } = await supabase.storage
            .from("report-images")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });

        if (error) {
            console.warn("Supabase Storage upload failed, falling back to base64:", error.message);
            return fileToBase64(file);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("report-images")
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (err) {
        console.warn("Image upload error, falling back to base64:", err);
        return fileToBase64(file);
    }
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
