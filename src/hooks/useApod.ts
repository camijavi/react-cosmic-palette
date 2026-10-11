import { useState, useEffect } from "react";

export interface ApodData{
    title: string,
    url: string,
    explanation: string,
    mediaType: string,
    date: string
}

export function useApod() {
    const [data, setData] = useState<ApodData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const apiKey = import.meta.env.VITE_NASA_API_KEY || "DEMO_KEY"
        fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
            setData(data);
            setLoading(false);
        });
    }, []);

    return {data, loading}
}