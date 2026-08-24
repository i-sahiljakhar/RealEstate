// import React, { useState } from "react";
// import { profileStyles as s } from "../../assets/dummyStyles";
// import { useAuth } from "../../context/AuthContext";
// import Navbar from "../../components/common/Navbar";
// import axios from "axios";
// import API_URL from "../../config";
// import {
//   HiCheck,
//   HiOutlineLocationMarker,
//   HiOutlineMail,
//   HiOutlinePhone,
//   HiOutlineUser,
//   HiX,
// } from "react-icons/hi";
// const Profile = () => {
//   const { user, setUser, token } = useAuth();
//   const [isEditing, setIsEditing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [removeProfilePic, setRemoveProfilePic] = useState(false);
//   const [formData, setFormData] = useState({
//     name: user?.name || "",
//     phone: user?.phone || "",
//     address: user?.address || "",
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "phone") {
//       //only 10 digit
//       const numericValue = value.replace(/\D/g, "").slice(0, 10);
//       setFormData({ ...formData, [name]: numericValue });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//       setRemoveProfilePic(false);
//     }
//   };
//   //to update your profile

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const data = new FormData();
//       data.append("name", formData.name);
//       data.append("phone", formData.phone);
//       data.append("address", formData.address);
//       if (imageFile) {
//         data.append("profilePic", imageFile);
//       }
//       if (removeProfilePic) {
//         data.append("removeProfilePic", "true");
//       }
//       const res = await axios.post(`${API_URL}/api/user/profile`, data, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       if (res.data.success) {
//         const updatedUser = res.data.user;
//         setUser(updatedUser);
//         localStorage.setItem("user", JSON.stringify(updatedUser));
//         setIsEditing(false);
//         setImageFile(null);
//         setImagePreview(null);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className={s.containerWrapper(user?.role)}>
//       {user?.role !== "seller" && <Navbar />}
//       <div className={s.mainContainer(user?.role)}>
//         <header className={s.header}>
//           <h1 className={s.pageTitle}>Personal Profile</h1>
//           <p className={s.pageSubtitle}>
//             Mange your personal information and account settings.
//           </p>
//         </header>
//         <div className={s.card}>
//           <div className={s.profileHeader}>
//             <div className={s.avatarSection}>
//               <div className={s.avatarWrapper}>
//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     alt="preview"
//                     className={s.avatarImage}
//                   />
//                 ) : !removeProfilePic && user?.profilePic ? (
//                   <img
//                     src={user.profilePic}
//                     alt="pic"
//                     className={s.avatarImage}
//                   />
//                 ) : (
//                   <span className={s.avatarPlaceholder}>
//                     {user?.name?.[0]?.toUpperCase() || "U"}
//                   </span>
//                 )}
//               </div>
//               {isEditing && (
//                 <>
//                   <label className={s.uploadButton}>
//                     <input
//                       type="file"
//                       onChange={handleImageChange}
//                       className="hidden"
//                       accept="image/*"
//                     />
//                     <HiOutlineUser size={20} />
//                   </label>
//                   {(imagePreview ||
//                     (!removeProfilePic && user?.profilePic)) && (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setImagePreview(null);
//                         setImageFile(null);
//                         setRemoveProfilePic(true);
//                       }}
//                       className={s.removeButton}
//                       title="remove profile picture"
//                     >
//                       <HiX size={20} />
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>
//             <div>
//               <h2 className={s.userName}>{user?.name}</h2>
//               <span className={s.roleBadge}>{user?.role?.toUpperCase()}</span>
//             </div>
//           </div>
//           {error && <div className={s.errorMessage}>{error}</div>}
//           {isEditing ? (
//             <form onSubmit={handleUpdate} className={s.editForm}>
//               <div>
//                 <label className={s.label}>Full Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleImageChange}
//                   className={s.input}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={s.label}>Phone Number</label>

//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   maxLength="10"
//                   pattern="\d*"
//                   className={s.input}
//                   placeholder="Enter your 10 digits phone number"
//                 />
//               </div>
//               <div>
//                 <label className={s.label}>Address</label>
//                 <textarea
//                   name="address"
//                   value={formData.address}
//                   onChange={handleInputChange}
//                   className={s.textarea}
//                   placeholder="Enter your address"
//                 ></textarea>
//               </div>
//               <div className={s.formActions}>
//                 <button
//                   type="submit"
//                   className={s.saveButton}
//                   disabled={loading}
//                 >
//                   <HiCheck size={20} /> {loading ? "Saving..." : "Save Changes"}
//                 </button>{" "}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setIsEditing(false);
//                     setImagePreview(null);
//                     setImageFile(null);
//                     setRemoveProfilePic(false);
//                   }}
//                 >
//                   <HiX size={20} />
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className={s.infoSection}>
//               <div className={s.infoItem}>
//                 <div className={s.infoIcon}>
//                   <HiOutlineMail size={20} />
//                 </div>
//                 <div>
//                   <div className={s.infoLabel}>Email Address</div>
//                   <div className={s.infoValue}>{user?.email}</div>
//                 </div>
//               </div>

//               <div className={s.infoItem}>
//                 <div className={s.infoIcon}>
//                   <HiOutlinePhone size={20} />
//                 </div>
//                 <div>
//                   <div className={s.infoLabel}>Phone Number</div>
//                   <div className={s.infoValue}>
//                     {user?.phone || "not provide"}
//                   </div>
//                 </div>
//               </div>

//               <div className={s.infoItem}>
//                 <div className={s.infoIcon}>
//                   <HiOutlineLocationMarker size={20} />
//                 </div>
//                 <div>
//                   <div className={s.infoLabel}>Location /address</div>
//                   <div className={s.infoValue}>
//                     {user?.address || "not provider"}
//                   </div>
//                 </div>
//               </div>
//               <div className={s.editButtonWrapper}>
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className={s.editProfileButton}
//                 >
//                   Edit Profile Details
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;


import React, { useState } from "react";
import { profileStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import axios from "axios";
import API_URL from "../../config";
import {
  HiCheck,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiX,
} from "react-icons/hi";

const Profile = () => {
  const { user, setUser, token } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Only allow 10 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle profile image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveProfilePic(false);
    }
  };

  // Remove profile picture
  const handleRemoveProfilePic = () => {
    setImagePreview(null);
    setImageFile(null);
    setRemoveProfilePic(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setImagePreview(null);
    setImageFile(null);
    setRemoveProfilePic(false);
    setError(null);

    // Reset form data
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
  };

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("address", formData.address);

      if (imageFile) {
        data.append("profilePic", imageFile);
      }

      if (removeProfilePic) {
        data.append("removeProfilePic", "true");
      }

      const res = await axios.put(
        `${API_URL}/api/user/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        const updatedUser = res.data.user;

        // Update AuthContext
        setUser(updatedUser);

        // Update localStorage
        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        // Exit edit mode
        setIsEditing(false);

        // Reset image states
        setImageFile(null);
        setImagePreview(null);
        setRemoveProfilePic(false);

        // Reset form
        setFormData({
          name: updatedUser?.name || "",
          phone: updatedUser?.phone || "",
          address: updatedUser?.address || "",
        });
      }
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.containerWrapper(user?.role)}>
      {/* Navbar */}
      {user?.role !== "seller" && <Navbar />}

      <div className={s.mainContainer(user?.role)}>
        {/* Header */}
        <header className={s.header}>
          <h1 className={s.pageTitle}>Personal Profile</h1>

          <p className={s.pageSubtitle}>
            Manage your personal information and account settings.
          </p>
        </header>

        {/* Profile Card */}
        <div className={s.card}>
          {/* Profile Header */}
          <div className={s.profileHeader}>
            {/* Avatar Section */}
            <div className={s.avatarSection}>
              <div className={s.avatarWrapper}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className={s.avatarImage}
                  />
                ) : !removeProfilePic && user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className={s.avatarImage}
                  />
                ) : (
                  <span className={s.avatarPlaceholder}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              {/* Image Controls */}
              {isEditing && (
                <div className="flex items-center gap-2">
                  {/* Upload Button */}
                  <label className={s.uploadButton}>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />

                    <HiOutlineUser size={20} />
                  </label>

                  {/* Remove Button */}
                  {(imagePreview ||
                    (!removeProfilePic && user?.profilePic)) && (
                    <button
                      type="button"
                      onClick={handleRemoveProfilePic}
                      className={s.removeButton}
                      title="Remove profile picture"
                    >
                      <HiX size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* User Name / Role */}
            <div>
              <h2 className={s.userName}>
                {user?.name}
              </h2>

              <span className={s.roleBadge}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={s.errorMessage}>
              {error}
            </div>
          )}

          {/* Edit Mode */}
          {isEditing ? (
            <form
              onSubmit={handleUpdate}
              className={s.editForm}
            >
              {/* Full Name */}
              <div>
                <label className={s.label}>
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={s.input}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className={s.label}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className={s.input}
                  placeholder="Enter your 10 digit phone number"
                />
              </div>

              {/* Address */}
              <div>
                <label className={s.label}>
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={s.textarea}
                  placeholder="Enter your address"
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div className={s.formActions}>
                {/* Save Button */}
                <button
                  type="submit"
                  className={s.saveButton}
                  disabled={loading}
                >
                  <HiCheck size={20} />

                  <span>
                    {loading
                      ? "Saving..."
                      : "Save Changes"}
                  </span>
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center gap-2"
                >
                  <HiX size={20} />

                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className={s.infoSection}>
              {/* Email */}
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlineMail size={20} />
                </div>

                <div>
                  <div className={s.infoLabel}>
                    Email Address
                  </div>

                  <div className={s.infoValue}>
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlinePhone size={20} />
                </div>

                <div>
                  <div className={s.infoLabel}>
                    Phone Number
                  </div>

                  <div className={s.infoValue}>
                    {user?.phone || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className={s.infoItem}>
                <div className={s.infoIcon}>
                  <HiOutlineLocationMarker size={20} />
                </div>

                <div>
                  <div className={s.infoLabel}>
                    Location / Address
                  </div>

                  <div className={s.infoValue}>
                    {user?.address || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div className={s.editButtonWrapper}>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user?.name || "",
                      phone: user?.phone || "",
                      address: user?.address || "",
                    });

                    setError(null);
                    setIsEditing(true);
                  }}
                  className={s.editProfileButton}
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;