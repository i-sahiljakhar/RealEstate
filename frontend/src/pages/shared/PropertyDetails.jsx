
import React, { useEffect, useState } from "react";
import { propertyDetailsStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../config";
import axios from "axios";
import {
  HiBadgeCheck,
  HiCalendar,
  HiChatAlt,
  HiChevronRight,
  HiCollection,
  HiHeart,
  HiLocationMarker,
  HiOutlineHeart,
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineViewGrid,
  HiX,
} from "react-icons/hi";
import PropertyCard from "../../components/common/PropertyCard";

const PropertyDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inquiry, setInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [inquiryStatus, setInquiryStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const [isInWishlist, setIsInWishlist] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Fetch property details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${API_URL}/api/property/${id}`,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          }
        );

        const propertyData = res.data.property || res.data;

        setProperty(propertyData);
        setSimilarProperties(
          Array.isArray(res.data.similarProperties)
            ? res.data.similarProperties
            : []
        );

        // Check wishlist
        if (user && user.role === "buyer" && token) {
          try {
            const wishRes = await axios.get(
              `${API_URL}/api/wishlist`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const wishlistData = Array.isArray(wishRes.data)
              ? wishRes.data
              : Array.isArray(wishRes.data?.wishlist)
              ? wishRes.data.wishlist
              : [];

            const found = wishlistData.some(
              (item) => item.property?._id === id
            );

            setIsInWishlist(found);
          } catch (wishlistError) {
            console.error(
              "WISHLIST FETCH ERROR:",
              wishlistError.response?.data ||
                wishlistError.message
            );
          }
        }
      } catch (err) {
        console.error(
          "PROPERTY DETAILS ERROR:",
          err.response?.data || err.message
        );

        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, user, token]);

  /*
    IMPORTANT:
    Your backend may return either:
      property.image
    or
      property.images

    So we normalize both into one array.
  */
  const images = Array.isArray(property?.images)
    ? property.images
    : Array.isArray(property?.image)
    ? property.image
    : [];

  // Wishlist toggle
  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyers can add properties to wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        await axios.delete(
          `${API_URL}/api/wishlist/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsInWishlist(false);
      } else {
        await axios.post(
          `${API_URL}/api/wishlist/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsInWishlist(true);
      }
    } catch (error) {
      console.error(
        "WISHLIST ERROR:",
        error.response?.data || error.message
      );

      alert("Failed to update wishlist");
    }
  };

  // Inquiry submit
  const handleInquirySubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyer can send inquiries");
      return;
    }

    setInquiryStatus({
      loading: true,
      success: false,
      error: null,
    });

    try {
      await axios.post(
        `${API_URL}/api/inquiry`,
        {
          propertyId: id,
          message: inquiry.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInquiryStatus({
        loading: false,
        success: true,
        error: null,
      });

      setInquiry((prev) => ({
        ...prev,
        message: "",
      }));
    } catch (error) {
      console.error(
        "INQUIRY ERROR:",
        error.response?.data || error.message
      );

      setInquiryStatus({
        loading: false,
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to send inquiry",
      });
    }
  };

  // Start chat
  const handleChatStart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer") {
      alert("Only buyer can chat with sellers");
      return;
    }

    const sellerId =
      property?.seller?._id ||
      property?.sellerId?._id ||
      property?.sellerId;

    if (!sellerId) {
      alert("Seller information not available");
      return;
    }

    try {
      const chatRes = await axios.post(
        `${API_URL}/api/chat/start`,
        {
          propertyId: id,
          sellerId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chat = chatRes.data?.chat || chatRes.data;

      if (!chat?._id) {
        throw new Error("Chat ID not received");
      }

      // Send initial property context message
      await axios.post(
        `${API_URL}/api/chat/send`,
        {
          chatId: chat._id,
          text: `Interested in property "${property.title}"`,
          image: images[0] || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //Get fresh chat after sending first message
      const freshChatRes = await axios.get(
        `${API_URL}/api/chat/${chat._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/chat-messages", {
        state: {
          chat: freshChatRes.data?.chat || freshChatRes.data,
        },
      });
    } catch (err) {
      console.error(
        "ERROR STARTING CHAT:",
        err.response?.data || err.message
      );

      alert("Failed to start chat");
    }
  };

  // Lightbox
  const openLightbox = (index) => {
    if (!images.length) return;

    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (!images.length) return;

    setLightboxIndex(
      (prev) => (prev + 1) % images.length
    );
  };

  const prevImage = () => {
    if (!images.length) return;

    setLightboxIndex(
      (prev) =>
        (prev - 1 + images.length) % images.length
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="loader-full-page">
        <div className="loader"></div>
      </div>
    );
  }

  // Error
  if (error || !property) {
    return (
      <div
        className="container"
        style={{
          padding: "4rem",
          textAlign: "center",
        }}
      >
        {error || "Property not found"}
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(Number(property.price) || 0);

  const propertyStatus =
    property.status?.toLowerCase() || "sale";

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <main className={s.mainContainer}>

        {/* Breadcrumb */}
        <nav className={s.breadcrumbs}>
          <Link
            to="/"
            className={s.breadcrumbLink}
          >
            Home
          </Link>

          <HiChevronRight />

          <Link
            to="/properties"
            className={s.breadcrumbLink}
          >
            Listings
          </Link>

          <HiChevronRight />

          <span className={s.breadcrumbCurrent}>
            {property.title}
          </span>
        </nav>

        {/* ================= GALLERY ================= */}
        <div className={s.galleryContainer}>

          {/* Desktop Gallery */}
          <div
            className={s.galleryGrid}
            style={{
              gridTemplateColumns:
                images.length > 1
                  ? "repeat(4, 1fr)"
                  : "1fr",

              gridTemplateRows:
                images.length > 1
                  ? "repeat(2, 180px)"
                  : "400px",
            }}
          >

            {/* Main Image */}
            {images.length > 0 ? (
              <div
                className={s.galleryMainItem(
                  images.length > 1
                )}
                onClick={() => openLightbox(0)}
              >
                <img
                  src={images[0]}
                  alt={property.title || "Property"}
                  className={s.galleryImage}
                />
              </div>
            ) : (
              <div
                className={s.galleryMainItem(false)}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  No Image Available
                </div>
              </div>
            )}

            {/* Side Images */}
            {images
              .slice(1, 5)
              .map((img, idx) => (
                <div
                  key={idx}
                  className={s.gallerySideItem}
                  onClick={() =>
                    openLightbox(idx + 1)
                  }
                >
                  <img
                    src={img}
                    alt={`Property ${idx + 2}`}
                    className={s.galleryImage}
                  />

                  {/* More Images */}
                  {idx === 3 &&
                    images.length > 5 && (
                      <div
                        className={
                          s.galleryMoreOverlay
                        }
                      >
                        +{images.length - 5}
                      </div>
                    )}
                </div>
              ))}
          </div>

          {/* Mobile Slider */}
          <div
            className={s.mobileSliderContainer}
          >
            <div className={s.mobileSliderTrack}>

              {images.length > 0 ? (
                images.map((img, idx) => (
                  <div
                    key={idx}
                    className={s.mobileSlide}
                    onClick={() =>
                      openLightbox(idx)
                    }
                  >
                    <img
                      src={img}
                      alt={`Property ${idx + 1}`}
                      className={s.mobileSlideImage}
                    />

                    <div
                      className={
                        s.mobileSlideCounter
                      }
                    >
                      {idx + 1} / {images.length}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={s.mobileSlide}
                >
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    No Image Available
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ================= LIGHTBOX ================= */}
        {lightboxIndex !== null &&
          images.length > 0 && (
            <div
              className={s.lightboxOverlay}
              onClick={closeLightbox}
            >
              <button
                onClick={closeLightbox}
                className={s.lightboxCloseBtn}
                type="button"
              >
                <HiX
                  size={24}
                  className={s.lightboxCloseIcon}
                />
              </button>

              <div
                onClick={(e) =>
                  e.stopPropagation()
                }
                className={s.lightboxContent}
              >
                <img
                  src={images[lightboxIndex]}
                  alt="Property"
                  className={s.lightboxImage}
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className={s.lightboxPrevBtn}
                    >
                      <HiChevronRight
                        size={30}
                        style={{
                          transform:
                            "rotate(180deg)",
                        }}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      className={s.lightboxNextBtn}
                    >
                      <HiChevronRight
                        size={30}
                      />
                    </button>
                  </>
                )}

                <div
                  className={s.lightboxCounter}
                >
                  {lightboxIndex + 1} /{" "}
                  {images.length}
                </div>
              </div>
            </div>
          )}

        {/* ================= MAIN CONTENT ================= */}
        <div className={s.detailsLayout}>

          {/* Info Column */}
          <div className={s.infoColumn}>

            <div className={s.infoHeader}>

              <div className={s.titleWrapper}>

                <div className={s.badgeWrapper}>
                  <span
                    className={
                      s.premiumBadge
                    }
                  >
                    Premium Listing
                  </span>
                </div>

                <h1
                  className={s.propertyTitle}
                >
                  {property.title}
                </h1>

                <p
                  className={
                    s.propertyLocation
                  }
                >
                  <HiLocationMarker
                    className={s.locationIcon}
                  />

                  <span
                    className={
                      s.locationText
                    }
                  >
                    {property.area || "N/A"},{" "}
                    {property.city || "N/A"}
                    {property.pincode
                      ? `, ${property.pincode}`
                      : ""}
                    , India
                  </span>
                </p>
              </div>

              <div
                className={s.actionButtons}
              >
                {(!user ||
                  user.role === "buyer") && (
                  <button
                    onClick={
                      handleWishlistToggle
                    }
                    className={s.wishlistButton(
                      isInWishlist
                    )}
                    type="button"
                  >
                    {isInWishlist ? (
                      <HiHeart
                        size={26}
                        fill="#ef4444"
                      />
                    ) : (
                      <HiOutlineHeart
                        size={26}
                      />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className={s.statsGrid}>
              {[
                {
                  label: "Bedrooms",
                  value: property.bhk || 0,
                  icon: HiOutlineHome,
                },
                {
                  label: "Bathrooms",
                  value:
                    property.bathrooms ||
                    Math.max(
                      1,
                      (parseInt(
                        property.bhk
                      ) || 1) - 1
                    ),
                  icon: HiOutlineUserGroup,
                },
                {
                  label: "Furnishing",
                  value:
                    property.furnishing ||
                    "N/A",
                  icon: HiCollection,
                },
                {
                  label: "Living Area",
                  value: property.areaSize
                    ? `${property.areaSize} sqft`
                    : "N/A",
                  icon: HiOutlineViewGrid,
                },
                {
                  label: "Type",
                  value:
                    property.propertyType ||
                    "N/A",
                  icon: HiCalendar,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={s.statCard}
                >
                  {stat.icon && (
                    <stat.icon
                      size={18}
                      className={s.statIcon}
                    />
                  )}

                  <div
                    className={s.statValue}
                  >
                    {stat.value}
                  </div>

                  <div
                    className={s.statLabel}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div
              className={
                s.descriptionSection
              }
            >
              <h3 className={s.sectionTitle}>
                Description
              </h3>

              <p
                className={s.descriptionText}
              >
                {property.description ||
                  "No description available for this property"}
              </p>
            </div>

            {/* Amenities */}
            <div
              className={s.amenitiesSection}
            >
              <h3 className={s.sectionTitle}>
                Amenities
              </h3>

              <div
                className={s.amenitiesGrid}
              >
                {(
                  Array.isArray(
                    property.amenities
                  ) &&
                  property.amenities.length > 0
                    ? property.amenities
                    : [
                        "Parking",
                        "Security",
                        "Water Supply",
                        "Power Backup",
                      ]
                ).map((amn, i) => (
                  <div
                    key={i}
                    className={s.amenityItem}
                  >
                    <HiBadgeCheck
                      size={18}
                      className={
                        s.amenityIcon
                      }
                    />

                    <span
                      className={
                        s.amenityText
                      }
                    >
                      {amn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div
            className={s.sidebarColumn}
          >

            {/* Price */}
            <div
              className={s.priceCard}
              style={{
                background:
                  "var(--primary)",
              }}
            >
              <div
                className={
                  s.priceCardLabel
                }
              >
                {propertyStatus === "rent"
                  ? "Rental Details"
                  : "Listing Price"}
              </div>

              <div
                className={
                  s.priceCardValue
                }
              >
                {propertyStatus === "rent"
                  ? `${Number(
                      property.price || 0
                    ).toLocaleString("en-IN")}`
                  : formattedPrice}

                {propertyStatus === "rent" && (
                  <span
                    className={
                      s.priceCardPeriod
                    }
                  >
                    /Month
                  </span>
                )}
              </div>

              {propertyStatus === "rent" && (
                <div
                  className={s.rentDetails}
                >
                  <div
                    className={
                      s.rentDetailRow
                    }
                  >
                    <span
                      className={
                        s.rentDetailLabel
                      }
                    >
                      Security Deposit
                    </span>

                    <span
                      className={
                        s.rentDetailValue
                      }
                    >
                      ₹
                      {Number(
                        property.securityDeposit ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div
                    className={
                      s.rentDetailRow
                    }
                  >
                    <span
                      className={
                        s.rentDetailLabel
                      }
                    >
                      Maintenance
                    </span>

                    <span
                      className={
                        s.rentDetailValue
                      }
                    >
                      ₹
                      {Number(
                        property.maintenance ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                      /mo
                    </span>
                  </div>
                </div>
              )}

              <div
                className={
                  s.priceCardAvailability
                }
              >
                Available for{" "}
                {propertyStatus === "rent"
                  ? "Rent"
                  : "Sale"}
              </div>
            </div>

            {/* Seller */}
            <div className={s.sellerCard}>

              <div className={s.sellerInfo}>

                <div
                  className={
                    s.sellerAvatar
                  }
                >
                  <img
                    src={
                      property.seller
                        ?.profilePic ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        property.seller
                          ?.name || "Seller"
                      )}&background=0d6e59&color=fff`
                    }
                    alt="Agent"
                    className={
                      s.sellerAvatarImage
                    }
                  />
                </div>

                <div
                  className={
                    s.sellerDetails
                  }
                >
                  <div
                    className={
                      s.sellerNameLink
                    }
                  >
                    <h4
                      className={
                        s.sellerName
                      }
                    >
                      {property.seller
                        ?.name || "Seller"}
                    </h4>
                  </div>

                  <div
                    className={
                      s.sellerVerifiedBadge
                    }
                  >
                    <HiBadgeCheck
                      className={
                        s.verifiedIcon
                      }
                    />
                    Verified Seller
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div
                className={
                  s.chatButtonWrapper
                }
              >
                <button
                  className={s.chatButton}
                  onClick={
                    handleChatStart
                  }
                  type="button"
                >
                  <HiChatAlt /> Chat
                </button>
              </div>

              {/* Inquiry */}
              <h4
                className={
                  s.inquiryFormTitle
                }
              >
                Inquire
              </h4>

              <form
                onSubmit={
                  handleInquirySubmit
                }
              >
                {user?.role === "buyer" ? (
                  <>
                    <textarea
                      placeholder="Your Message..."
                      value={
                        inquiry.message
                      }
                      onChange={(e) =>
                        setInquiry(
                          (prev) => ({
                            ...prev,
                            message:
                              e.target.value,
                          })
                        )
                      }
                      className={
                        s.inquiryTextarea
                      }
                      required
                    />

                    <button
                      type="submit"
                      className={
                        s.inquirySubmitButton
                      }
                      disabled={
                        inquiryStatus.loading
                      }
                    >
                      {inquiryStatus.loading
                        ? "Sending..."
                        : "Send Inquiry"}
                    </button>

                    {inquiryStatus.success && (
                      <p
                        className={
                          s.inquirySuccessMessage
                        }
                      >
                        Inquiry sent!
                      </p>
                    )}

                    {inquiryStatus.error && (
                      <p
                        style={{
                          color: "red",
                          marginTop: "8px",
                        }}
                      >
                        {
                          inquiryStatus.error
                        }
                      </p>
                    )}
                  </>
                ) : (
                  <div
                    className={
                      s.inquiryDisabledMessage
                    }
                  >
                    <p
                      className={
                        s.inquiryDisabledText
                      }
                    >
                      {user
                        ? "Only buyers can send inquiries."
                        : "Please login as a buyer to send inquiries."}
                    </p>

                    {!user && (
                      <Link
                        to="/login"
                        className={
                          s.inquiryLoginButton
                        }
                      >
                        Login
                      </Link>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div
          className={s.additionalDetails}
        >
          <h3 className={s.detailsTitle}>
            Property details
          </h3>

          <div className={s.detailsGrid}>
            {[
              {
                label: "Property ID",
                value: property._id
                  ? property._id
                      .slice(-8)
                      .toUpperCase()
                  : "N/A",
              },
              {
                label: "Added On",
                value: property.createdAt
                  ? new Date(
                      property.createdAt
                    ).toLocaleDateString()
                  : "N/A",
              },
              {
                label: "Property Type",
                value:
                  property.propertyType ||
                  "N/A",
              },
              {
                label: "Status",
                value: `For ${
                  property.status || "N/A"
                }`,
              },
            ].map((detail, i) => (
              <div
                key={i}
                className={s.detailRow}
              >
                <span
                  className={s.detailValue}
                >
                  {detail.label}
                </span>

                <span
                  className={s.detailValue}
                >
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar Properties */}
        <section
          className={s.similarSection}
        >
          <div
            className={s.similarHeader}
          >
            <div>
              <h2
                className={s.similarTitle}
              >
                Similar Properties
              </h2>

              <p
                className={
                  s.similarSubtitle
                }
              >
                Listing you might like in{" "}
                {property.city || "your area"}.
              </p>
            </div>

            <Link
              to="/properties"
              className={s.similarAllLink}
            >
              All Listing{" "}
              <HiChevronRight />
            </Link>
          </div>

          <div className={s.similarGrid}>
            {similarProperties.length >
            0 ? (
              similarProperties
                .slice(0, 3)
                .map((p) => (
                  <PropertyCard
                    key={p._id}
                    property={p}
                  />
                ))
            ) : (
              <div
                className={
                  s.similarEmptyState
                }
              >
                No similar properties found in
                this location.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PropertyDetails;