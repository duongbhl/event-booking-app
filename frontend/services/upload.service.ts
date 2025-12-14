export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();

    formData.append("file", {
        uri: uri.startsWith("file://") ? uri : `file://${uri}`,
        type: "image/jpeg",
        name: "event.jpg",
    } as any);

    // ⚠️ PHẢI ĐÚNG preset unsigned
    formData.append("upload_preset", "event_booking_unsigned");

    // (optional)
    formData.append("folder", "event-booking");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dx1wy7bnt/image/upload",
        {
            method: "POST",
            body: formData, // ❌ KHÔNG headers
        }
    );

    const json = await res.json();
    console.log("CLOUDINARY RESPONSE:", json);

    if (!json.secure_url) {
        throw new Error(json?.error?.message || "Upload failed");
    }


    console.log("UPLOAD URI:", uri);
    return json.secure_url;


};
