import React, { useEffect, useState } from "react";

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        console.log(data);
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  const createMailToLink = () => {
    const subject = encodeURIComponent(`Regarding ${listing.name}`);
    const body = encodeURIComponent(message);
    return `mailto:${landlord.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact
            <span className="font-semibold"> {landlord.username}</span> for
            <span className="font-semibold"> {listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows={2}
            value={message}
            onChange={onChange}
            placeholder="Enter your message here..."
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <a
            href={createMailToLink()}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
          >
            Send Message
          </a>
        </div>
      )}
    </>
  );
}
