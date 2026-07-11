import React from 'react'
import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const GoBack = () => {
    const navigate = useNavigate();
  return (
     <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
            <FaArrowCircleLeft />
            Back
        </button>
  )
}

export default GoBack
