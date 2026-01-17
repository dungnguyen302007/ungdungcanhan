export interface WeatherData {
    temp: string;
    description: string;
}

export const fetchWeather = async (city: string = 'Hue'): Promise<WeatherData | null> => {
    console.log(`Fetching weather for ${city}...`);
    try {
        const response = await fetch(`https://wttr.in/${city}?format=%t|%C&lang=vi`);
        console.log('Weather response status:', response.status);
        if (!response.ok) throw new Error('Weather fetch failed');

        const data = await response.text();
        console.log('Weather data received:', data);
        const [temp, description] = data.split('|');

        return {
            temp: temp.trim(),
            description: description.trim()
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
};

export const formatWeatherNotification = (weather: WeatherData): string => {
    return `Dự báo thời tiết hôm nay tại Huế: ${weather.description}, nhiệt độ ${weather.temp}. Chúc anh Dũng một ngày tốt lành!`;
};


