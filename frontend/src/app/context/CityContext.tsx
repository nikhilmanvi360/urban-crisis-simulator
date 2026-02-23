import React, { createContext, useContext, useState } from 'react';
import { INDIAN_CITIES, DEFAULT_CITY_ID, CityProfile, getCityById } from '../data/cities';

interface CityContextType {
    city: CityProfile;
    setCityById: (id: string) => void;
    allCities: CityProfile[];
}

const CityContext = createContext<CityContextType>({
    city: getCityById(DEFAULT_CITY_ID),
    setCityById: () => { },
    allCities: INDIAN_CITIES,
});

export function CityProvider({ children }: { children: React.ReactNode }) {
    const [cityId, setCityId] = useState<string>(DEFAULT_CITY_ID);

    const setCityById = (id: string) => {
        setCityId(id);
    };

    return (
        <CityContext.Provider
            value={{
                city: getCityById(cityId),
                setCityById,
                allCities: INDIAN_CITIES,
            }}
        >
            {children}
        </CityContext.Provider>
    );
}

export function useCity() {
    return useContext(CityContext);
}
