// import React, { useEffect, useState } from "react";
// import { wishlistStyles as s } from "../../assets/dummyStyles";
// import { useAuth } from "../../context/AuthContext";
// import Navbar from "../../components/common/Navbar";
// import axios from "axios";
// import API_URL from "../../config";
// import { HiHeart, HiTrash } from "react-icons/hi";
// import { Link } from "react-router";
// import PropertyCard from "../../components/common/PropertyCard";

// const Wishlist = () => {
//   const { token } = useAuth();
//   const [wishlistItems, setWishlistItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchWishlist();
//   }, []);

//   const fetchWishlist = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/wishlist`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setWishlistItems(res.data);
//       setLoading(false);
//     } catch (error) {
//       setError("Failed to load wishlist.");
//       setLoading(false);
//     }
//   };
//   // to remove property from wishlist

//   const removeFromWishlist = async (propertyId) => {
//     if (!propertyId) {
//       alert("Invalid Property ID");
//       return;
//     }
//     try {
//       await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setWishlistItems((prev) =>
//         prev.filter(
//           (item) => item.property && item.property._id !== propertyId,
//         ),
//       );
//     } catch (error) {
//       const errorMsg =
//         err.response?.data?.message || "Failed to remove wishlist.";
//       alert(errorMsg);
//     }
//   };
//   if (loading) {
//     return (
//       <div className={s.loaderFullPage}>
//         <div className={s.loader}></div>
//       </div>
//     );
//   }
//   return (
//     <div className={s.pageContainer}>
//       <Navbar />

//       <main className={s.mainContainer}>
//         <div className={s.headingWrapper}>
//           <h1 className={s.heading}>Your Wishlist</h1>
//           <p className={s.subheading}>Properties you've saved for later.</p>
//         </div>
//         {wishlistItems.length === 0 ? (
//           <div className={s.emptyCard}>
//             <div className={s.emptyIconWrapper}>
//               <HiHeart size={40} />
//             </div>
//             <h2 className={s.emptyTitle}>Your Wishlist is empty</h2>
//             <p className={s.emptyText}>
//               Start exploring properties and save your favorites
//             </p>
//             <Link to="/" className={s.browseButton}>
//               Browse Properties
//             </Link>
//           </div>
//         ) : (
//           <div className={s.gridContainer}>
//             {wishlistItems
//               .filter((item) => item.property)
//               .map((item) => (
//                 <PropertyCard
//                   key={item._id}
//                   property={item.property}
//                   renderActions={() => (
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         removeFromWishlist(item.property._id);
//                       }}
//                       className={s.removeButton}
//                     >
//                       <HiTrash size={18} />
//                       Remove From Wishlist
//                     </button>
//                   )}
//                 />
//               ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Wishlist;
 
//======================================================
// ==================update version ===================
//=====================================================

import React, { useEffect, useState } from "react";
import { wishlistStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import axios from "axios";
import API_URL from "../../config";
import { HiHeart, HiTrash } from "react-icons/hi";
import { Link } from "react-router";
import PropertyCard from "../../components/common/PropertyCard";

const Wishlist = () => {
  const { token } = useAuth();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Fetch wishlist
 const fetchWishlist = async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await axios.get(`${API_URL}/api/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Wishlist API Response:", res.data);

    const wishlistData = Array.isArray(res.data)
      ? res.data
      : res.data.data || [];

    setWishlistItems(wishlistData);
  } catch (error) {
    console.error("Fetch wishlist error:", error);

    setError(
      error.response?.data?.message || "Failed to load wishlist."
    );

    setWishlistItems([]);
  } finally {
    setLoading(false);
  }
};

  // Remove property from wishlist
  const removeFromWishlist = async (propertyId) => {
    if (!propertyId) {
      alert("Invalid Property ID");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/wishlist/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove item from UI
      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            item.property &&
            item.property._id !== propertyId
        )
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);

      const errorMsg =
        error.response?.data?.message ||
        "Failed to remove wishlist.";

      alert(errorMsg);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>
        <div className={s.headingWrapper}>
          <h1 className={s.heading}>Your Wishlist</h1>

          <p className={s.subheading}>
            Properties you've saved for later.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className={s.errorMessage}>
            {error}
          </div>
        )}

        {/* Empty Wishlist */}
        {wishlistItems.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiHeart size={40} />
            </div>

            <h2 className={s.emptyTitle}>
              Your Wishlist is empty
            </h2>

            <p className={s.emptyText}>
              Start exploring properties and save your favorites
            </p>

            <Link to="/" className={s.browseButton}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className={s.gridContainer}>
            {wishlistItems
              .filter((item) => item.property)
              .map((item) => (
                <PropertyCard
                  key={item._id}
                  property={item.property}
                  renderActions={() => (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        removeFromWishlist(
                          item.property._id
                        );
                      }}
                      className={s.removeButton}
                    >
                      <HiTrash size={18} />
                      Remove From Wishlist
                    </button>
                  )}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;

//==================================
//==============           =========
//==================================