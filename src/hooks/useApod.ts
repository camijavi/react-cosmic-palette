import { useState, useEffect } from "react";

export interface ApodData{
    title: string,
    url: string,
    explanation: string,
    media_type: string,
    date: string
}

export function useApod() {
    const [data, setData] = useState<ApodData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1`)
        .then((res) => res.json())
        .then((jsonArray) => {
            setData(jsonArray[0]);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fecthing the APOD:", err);
            setLoading(false);
        });
    }, []);

    return {data, loading}
}