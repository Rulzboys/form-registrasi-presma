// components/WhatsAppButton.tsx
import React from "react";

function WhatsAppButton() {
    const phoneNumber = "6283102655384"; // Ganti dengan nomor admin kamu
    const message = "Halo Admin, saya ingin bertanya.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="wa-float">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-link"
            >
                <img
                    src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
                    alt="WhatsApp" />
                <span className="wa-label">Butuh Bantuan? Hubungi Admin Disini</span>
            </a>
        </div>
    );
}

export default WhatsAppButton;
