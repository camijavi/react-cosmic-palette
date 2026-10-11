import { useState, useEffect } from "react";

export interface ApodData {
    title: string;
    url: string;
    hdurl?: string;
    explanation: string;
    media_type: string;
    date: string;
    copyright?: string;
    credit?: string;
}

interface RawApodItem {
    title: string;
    url: string;
    hdurl?: string;
    explanation: string;
    media_type: string;
    date: string;
    copyright?: string;
    credit?: string;
}

export function useApod() {
    const [apodList, setApodList] = useState<ApodData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetch(`https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=12`)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json() as Promise<RawApodItem[]>;
        })
        .then((jsonArray) => {
            if (!isMounted) return;
            const formatted: ApodData[] = jsonArray.map((item) => {
                const imageUrl = item.hdurl || item.url;
                return {
                    ...item,
                    url: imageUrl,
                    hdurl: item.hdurl || imageUrl,
                };
            });
            setApodList(formatted);
            setCurrentIndex(0);
            setLoading(false);
        })
        .catch((err) => {
            if (!isMounted) return;
            console.error("Error fetching APOD list:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch APOD");
            setLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const data = apodList[currentIndex] || null;

    const nextApod = () => {
        if (currentIndex < apodList.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const prevApod = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const selectIndex = (index: number) => {
        if (index >= 0 && index < apodList.length) {
            setCurrentIndex(index);
        }
    };

    return {
        data,
        apodList,
        currentIndex,
        totalItems: apodList.length,
        loading,
        error,
        nextApod,
        prevApod,
        selectIndex,
    };
}