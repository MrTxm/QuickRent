import React from 'react'

const Location = () => {
  return (
    <div className="w-full h-[300px] lg:h-[450px] rounded-xl overflow-hidden shadow-lg">
      <iframe
        className="w-full h-full"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d247.4753617082376!2d80.57311242280466!3d7.055520774871465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae376e96475eea9%3A0x53dbbbfcff705b84!2sHapugastalawa!5e0!3m2!1sen!2slk!4v1777029541908!5m2!1sen!2slk"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="QuickRent Location"
      />
    </div>
  )
}

export default Location