'use client'

import LandlordRenewRequestCard, { RenewRequestData } from "./LandlordRenewRequestCard";

export default function LandlordRenewRequests() {

    const requests: RenewRequestData[] = [
        {
            image: "/properties/property-5.jpg",
            type: "Entire apartment",
            title: "Modern City Loft with Skyline View",
            rating: 4.8,
            reviews: 220,
            price: 2800,
            discount: 500,
            total: 2300,
        },
        {
            image: "/properties/property-2.jpg",
            type: "Entire cabin",
            title: "Glacier Pines Cabin (New Hot Tub Installed!)",
            rating: 4.66,
            reviews: 110,
            price: 2500,
            discount: 1200,
            total: 1300,
        },
        {
            image: "/properties/property-3.jpg",
            type: "Private villa",
            title: "Luxury Beachfront Villa with Pool",
            rating: 4.9,
            reviews: 75,
            price: 5000,
            discount: 1500,
            total: 3500,
        },
        {
            image: "/properties/property-4.jpg",
            type: "Studio",
            title: "Cozy Downtown Studio near Metro",
            rating: 4.5,
            reviews: 300,
            price: 1800,
            discount: 300,
            total: 1500,
        },
        {
            image: "/properties/property-5.jpg",
            type: "Entire house",
            title: "Family Home with Garden and Garage",
            rating: 4.7,
            reviews: 90,
            price: 3200,
            discount: 800,
            total: 2400,
        },
    ];

    return (
        <div>
            <div
                className="
             grid gap-5
             
             grid-cols-1
             sm:grid-cols-2
             lg:grid-cols-3
             2xl:grid-cols-4
           "
            >
                {requests.map((req, idx) => {

                    return <LandlordRenewRequestCard
                        key={idx}
                        data={req}
                        onCancel={() => console.log("Cancel request", idx)}
                        onRenew={() => console.log("Renew request", idx)}
                    />
                })}
            </div>
        </div>
    );
}