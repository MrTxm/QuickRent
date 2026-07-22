import React from 'react';
import { useNavigate } from "react-router-dom";
import Location from '../components/Location.jsx';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
                <h1 className="text-5xl lg:text-7xl font-bold dark:text-white">About QuickRent</h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Redefining equipment rental with excellence, reliability, and innovation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-4xl font-semibold dark:text-white mb-6">
                            Our Story
                        </h2>
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                            At QuickRent, we believe that quality equipment should be accessible to everyone. 
                            Whether you're a construction professional, an adventurer, or a tech enthusiast, 
                            we provide premium tools and gear with seamless booking and reliable service.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-4xl font-semibold dark:text-white mb-6">
                            Why Choose Us?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                "Premium Quality Equipment",
                                "Seamless Online Booking",
                                "Transparent Pricing",
                                "Timely Support & Reminders",
                                "Trusted Professionals",
                                "Nationwide Delivery"
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                                        ✓
                                    </div>
                                    <p className="text-lg dark:text-gray-300">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <button 
                        onClick={() => navigate('/Services')}
                        className="bg-mainbtn text-black px-10 py-4 rounded-full text-lg font-medium hover:scale-105 transition-all"
                    >
                        Explore Our Collection
                    </button> */}
                </div>

                {/* Right Side - Location/Map */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700">
                    <Location />
                </div>
            </div>

            {/* Values Section */}
            <div className="mt-24">
                <h2 className="text-4xl font-bold text-center dark:text-white mb-12">Our Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Quality First",
                            desc: "Only premium, well-maintained equipment makes it to our platform."
                        },
                        {
                            title: "Customer Centric",
                            desc: "Your satisfaction and convenience are at the heart of everything we do."
                        },
                        {
                            title: "Reliability",
                            desc: "On-time delivery, honest pricing, and trustworthy service."
                        }
                    ].map((value, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center text-3xl mb-6">
                                {index === 0 ? "⭐" : index === 1 ? "❤️" : "🔒"}
                            </div>
                            <h3 className="text-2xl font-semibold dark:text-white mb-3">{value.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;