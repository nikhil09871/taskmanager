import { useState } from "react";
import axios from "axios";

const UploadProfilePicture = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // Preview the image
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", image);

      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/auth/upload-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Profile Picture Uploaded!");
      console.log("Response: ", response.data);
    } catch (error) {
      console.error("❌ Upload Error: ", error);
      alert("Error uploading image.");
    }
  };

  return (
    <div>
      <h2>Upload Profile Picture</h2>
      {preview && <img src={preview} alt="Preview" width="150" />}
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadProfilePicture;
