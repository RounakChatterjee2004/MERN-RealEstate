import { getDownloadURL } from "firebase/storage";
import { uploadBytesResumable } from "firebase/storage";
import { getStorage, ref } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useParams } from "react-router";

export default function Updateisting() {
  const [files, setfiles] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [error, SetError] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useParams();
  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch(`/api/listing/get/${params.listingId}`);
      const data = await res.json();
      setFormData(data); // set formdata to existing value

      if (data.success === false) {
        console.log(data.message);
        return;
      }
    };
    fetchListing();
  }, []);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    offer: false,
    regularPrice: 50,
    discountedPrice: 20,
  });

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    // Handle the "name" field
    if (id === "name") {
      setFormData({ ...formData, name: value });
    }

    // Handle the "description" field
    else if (id === "description") {
      setFormData({ ...formData, description: value });
    }

    // Handle the "address" field
    else if (id === "address") {
      setFormData({ ...formData, address: value });
    }

    // Handle the "sale" and "rent" radio buttons
    else if (id === "sale" || id === "rent") {
      setFormData({ ...formData, type: id });
    }

    // Handle checkboxes like "parking", "furnished", "offer"
    else if (type === "checkbox") {
      setFormData({ ...formData, [id]: checked });
    }

    // Handle any other fields like "bedrooms", "bathrooms", etc.
    else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const [uploading, setUploading] = useState(false);
  // jab tak saare files upload nahi hoo jate tab tak wait karo
  console.log(formData);
  const handleImageSubmit = (e) => {
    const promises = [];
    setUploading(true);
    setImageUploadError(false);

    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }

      //wait untill all the promises resolve
      Promise.all(promises)
        .then((urls) => {
          // keep the prevoious formdata and the previous image urls as it is only add the newly added ones
          setFormData({
            ...formData,

            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError("Image Upload Fail (2 mb/image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can upload upto 6 images");
      setUploading(false);
    }
  };
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      // Get a reference to the Firebase Storage service
      const storage = getStorage(app);

      // Generate a unique file name using the current timestamp and the original file name
      const fileName = new Date().getTime() + file.name;

      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, fileName);

      // Upload the file to Firebase Storage using the resumable upload method
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Listen for state changes on the upload task
      uploadTask.on(
        "state_changed",
        // Handle upload errors
        (spanshot) => {
          const progress =
            (spanshot.bytesTransferred / spanshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        // Handle successful upload
        () => {
          // Get the download URL of the uploaded file and resolve it and send it
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.imageUrls.length < 1)
        return SetError("You must upload at least one image");
      if (formData.regularPrice < formData.discountedPrice)
        return SetError("Discount price must be lower than regular price");
      setLoading(true);
      SetError(false);

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        SetError(data.message);
        setLoading(false);
        return;
      }
      navigate(`/listing/${data._id}`);
      setLoading(false);
    } catch (err) {
      SetError(err.message);
      setLoading(false);
    }
  };
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="100000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountedPrice"
                min="0"
                max="100000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.discountedPrice}
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setfiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={uploading}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : " Upload"}
            </button>
          </div>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={index}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}

          <p className="text-red-700">{imageUploadError && imageUploadError}</p>

          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Creating..." : "Update Listing"}
          </button>
          <p className="text-red-700">{error ? error : ""}</p>
        </div>
      </form>
    </main>
  );
}
