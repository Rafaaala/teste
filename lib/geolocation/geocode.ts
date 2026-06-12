// lib/geolocation/geocode.ts

export async function geocodeAddress(
    street:       string,
    number:       string,
    city:         string,
    state:        string
  ): Promise<{ latitude: number; longitude: number } | null> {
    const query = encodeURIComponent(
      `${street} ${number}, ${city}, ${state}, Brasil`
    )
  
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          // Nominatim exige um User-Agent identificando sua aplicação
          'User-Agent': 'RestauranteJapones/1.0'
        }
      }
    )
  
    const data = await res.json()
  
    if (!data.length) return null
  
    return {
      latitude:  parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    }
  }