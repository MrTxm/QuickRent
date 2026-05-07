import React from 'react'

const Location = () => {
  return (
    <div className="w-full h-[300px] lg:h-[450px] rounded-xl overflow-hidden shadow-lg">
      <iframe
        className="w-full h-full"
        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d250.0528184207836!2d80.57214621253736!3d7.056282807294807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2slk!4v1778165812968!5m2!1sen!2slk"
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
