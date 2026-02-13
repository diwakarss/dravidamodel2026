import type { FeatureCollection, Polygon } from "geojson";

export interface DistrictProperties {
  district: string;
  district_ta: string;
}

export const tnDistrictsGeoJSON: FeatureCollection<Polygon, DistrictProperties> = {
  type: "FeatureCollection",
  features: [
    {"type":"Feature","properties":{"district":"Chennai","district_ta":"சென்னை"},"geometry":{"type":"Polygon","coordinates":[[[80.17,13.0],[80.32,13.0],[80.32,13.15],[80.17,13.15],[80.17,13.0]]]}},
    {"type":"Feature","properties":{"district":"Coimbatore","district_ta":"கோயம்புத்தூர்"},"geometry":{"type":"Polygon","coordinates":[[[76.7,10.8],[77.2,10.8],[77.2,11.3],[76.7,11.3],[76.7,10.8]]]}},
    {"type":"Feature","properties":{"district":"Madurai","district_ta":"மதுரை"},"geometry":{"type":"Polygon","coordinates":[[[77.8,9.7],[78.3,9.7],[78.3,10.2],[77.8,10.2],[77.8,9.7]]]}},
    {"type":"Feature","properties":{"district":"Tiruchirappalli","district_ta":"திருச்சிராப்பள்ளி"},"geometry":{"type":"Polygon","coordinates":[[[78.4,10.6],[78.9,10.6],[78.9,11.1],[78.4,11.1],[78.4,10.6]]]}},
    {"type":"Feature","properties":{"district":"Salem","district_ta":"சேலம்"},"geometry":{"type":"Polygon","coordinates":[[[77.9,11.4],[78.4,11.4],[78.4,11.9],[77.9,11.9],[77.9,11.4]]]}},
    {"type":"Feature","properties":{"district":"Tirunelveli","district_ta":"திருநெல்வேலி"},"geometry":{"type":"Polygon","coordinates":[[[77.3,8.4],[77.8,8.4],[77.8,8.9],[77.3,8.9],[77.3,8.4]]]}},
    {"type":"Feature","properties":{"district":"Tiruppur","district_ta":"திருப்பூர்"},"geometry":{"type":"Polygon","coordinates":[[[77.2,10.9],[77.7,10.9],[77.7,11.4],[77.2,11.4],[77.2,10.9]]]}},
    {"type":"Feature","properties":{"district":"Erode","district_ta":"ஈரோடு"},"geometry":{"type":"Polygon","coordinates":[[[77.4,11.2],[77.9,11.2],[77.9,11.7],[77.4,11.7],[77.4,11.2]]]}},
    {"type":"Feature","properties":{"district":"Vellore","district_ta":"வேலூர்"},"geometry":{"type":"Polygon","coordinates":[[[78.8,12.6],[79.3,12.6],[79.3,13.1],[78.8,13.1],[78.8,12.6]]]}},
    {"type":"Feature","properties":{"district":"Thoothukudi","district_ta":"தூத்துக்குடி"},"geometry":{"type":"Polygon","coordinates":[[[78.0,8.6],[78.5,8.6],[78.5,9.1],[78.0,9.1],[78.0,8.6]]]}},
    {"type":"Feature","properties":{"district":"Thanjavur","district_ta":"தஞ்சாவூர்"},"geometry":{"type":"Polygon","coordinates":[[[79.0,10.5],[79.5,10.5],[79.5,11.0],[79.0,11.0],[79.0,10.5]]]}},
    {"type":"Feature","properties":{"district":"Dindigul","district_ta":"திண்டுக்கல்"},"geometry":{"type":"Polygon","coordinates":[[[77.6,10.2],[78.1,10.2],[78.1,10.7],[77.6,10.7],[77.6,10.2]]]}},
    {"type":"Feature","properties":{"district":"Kanchipuram","district_ta":"காஞ்சிபுரம்"},"geometry":{"type":"Polygon","coordinates":[[[79.7,12.5],[80.2,12.5],[80.2,13.0],[79.7,13.0],[79.7,12.5]]]}},
    {"type":"Feature","properties":{"district":"Cuddalore","district_ta":"கடலூர்"},"geometry":{"type":"Polygon","coordinates":[[[79.4,11.4],[79.9,11.4],[79.9,11.9],[79.4,11.9],[79.4,11.4]]]}},
    {"type":"Feature","properties":{"district":"Kanyakumari","district_ta":"கன்னியாகுமரி"},"geometry":{"type":"Polygon","coordinates":[[[77.2,8.0],[77.7,8.0],[77.7,8.5],[77.2,8.5],[77.2,8.0]]]}},
    {"type":"Feature","properties":{"district":"Tiruvallur","district_ta":"திருவள்ளூர்"},"geometry":{"type":"Polygon","coordinates":[[[79.8,13.0],[80.3,13.0],[80.3,13.5],[79.8,13.5],[79.8,13.0]]]}},
    {"type":"Feature","properties":{"district":"Villupuram","district_ta":"விழுப்புரம்"},"geometry":{"type":"Polygon","coordinates":[[[79.2,11.7],[79.7,11.7],[79.7,12.2],[79.2,12.2],[79.2,11.7]]]}},
    {"type":"Feature","properties":{"district":"Namakkal","district_ta":"நாமக்கல்"},"geometry":{"type":"Polygon","coordinates":[[[78.0,11.0],[78.5,11.0],[78.5,11.5],[78.0,11.5],[78.0,11.0]]]}},
    {"type":"Feature","properties":{"district":"Dharmapuri","district_ta":"தர்மபுரி"},"geometry":{"type":"Polygon","coordinates":[[[77.8,11.8],[78.3,11.8],[78.3,12.3],[77.8,12.3],[77.8,11.8]]]}},
    {"type":"Feature","properties":{"district":"Krishnagiri","district_ta":"கிருஷ்ணகிரி"},"geometry":{"type":"Polygon","coordinates":[[[77.9,12.2],[78.4,12.2],[78.4,12.7],[77.9,12.7],[77.9,12.2]]]}},
    {"type":"Feature","properties":{"district":"Ramanathapuram","district_ta":"இராமநாதபுரம்"},"geometry":{"type":"Polygon","coordinates":[[[78.5,9.2],[79.0,9.2],[79.0,9.7],[78.5,9.7],[78.5,9.2]]]}},
    {"type":"Feature","properties":{"district":"Virudhunagar","district_ta":"விருதுநகர்"},"geometry":{"type":"Polygon","coordinates":[[[77.8,9.3],[78.3,9.3],[78.3,9.8],[77.8,9.8],[77.8,9.3]]]}},
    {"type":"Feature","properties":{"district":"Sivaganga","district_ta":"சிவகங்கை"},"geometry":{"type":"Polygon","coordinates":[[[78.3,9.6],[78.8,9.6],[78.8,10.1],[78.3,10.1],[78.3,9.6]]]}},
    {"type":"Feature","properties":{"district":"Pudukkottai","district_ta":"புதுக்கோட்டை"},"geometry":{"type":"Polygon","coordinates":[[[78.6,10.1],[79.1,10.1],[79.1,10.6],[78.6,10.6],[78.6,10.1]]]}},
    {"type":"Feature","properties":{"district":"Perambalur","district_ta":"பெரம்பலூர்"},"geometry":{"type":"Polygon","coordinates":[[[78.7,11.0],[79.2,11.0],[79.2,11.5],[78.7,11.5],[78.7,11.0]]]}},
    {"type":"Feature","properties":{"district":"Ariyalur","district_ta":"அரியலூர்"},"geometry":{"type":"Polygon","coordinates":[[[79.0,11.0],[79.5,11.0],[79.5,11.5],[79.0,11.5],[79.0,11.0]]]}},
    {"type":"Feature","properties":{"district":"Nagapattinam","district_ta":"நாகப்பட்டினம்"},"geometry":{"type":"Polygon","coordinates":[[[79.5,10.5],[80.0,10.5],[80.0,11.0],[79.5,11.0],[79.5,10.5]]]}},
    {"type":"Feature","properties":{"district":"Tiruvarur","district_ta":"திருவாரூர்"},"geometry":{"type":"Polygon","coordinates":[[[79.3,10.5],[79.8,10.5],[79.8,11.0],[79.3,11.0],[79.3,10.5]]]}},
    {"type":"Feature","properties":{"district":"Karur","district_ta":"கரூர்"},"geometry":{"type":"Polygon","coordinates":[[[78.0,10.7],[78.5,10.7],[78.5,11.2],[78.0,11.2],[78.0,10.7]]]}},
    {"type":"Feature","properties":{"district":"The Nilgiris","district_ta":"நீலகிரி"},"geometry":{"type":"Polygon","coordinates":[[[76.4,11.2],[76.9,11.2],[76.9,11.7],[76.4,11.7],[76.4,11.2]]]}},
    {"type":"Feature","properties":{"district":"Theni","district_ta":"தேனி"},"geometry":{"type":"Polygon","coordinates":[[[77.3,9.8],[77.8,9.8],[77.8,10.3],[77.3,10.3],[77.3,9.8]]]}},
    {"type":"Feature","properties":{"district":"Tiruvannamalai","district_ta":"திருவண்ணாமலை"},"geometry":{"type":"Polygon","coordinates":[[[78.9,12.0],[79.4,12.0],[79.4,12.5],[78.9,12.5],[78.9,12.0]]]}},
    {"type":"Feature","properties":{"district":"Ranipet","district_ta":"ராணிப்பேட்டை"},"geometry":{"type":"Polygon","coordinates":[[[79.2,12.7],[79.7,12.7],[79.7,13.2],[79.2,13.2],[79.2,12.7]]]}},
    {"type":"Feature","properties":{"district":"Chengalpattu","district_ta":"செங்கல்பட்டு"},"geometry":{"type":"Polygon","coordinates":[[[79.8,12.3],[80.3,12.3],[80.3,12.8],[79.8,12.8],[79.8,12.3]]]}},
    {"type":"Feature","properties":{"district":"Kallakurichi","district_ta":"கள்ளக்குறிச்சி"},"geometry":{"type":"Polygon","coordinates":[[[78.8,11.6],[79.3,11.6],[79.3,12.1],[78.8,12.1],[78.8,11.6]]]}},
    {"type":"Feature","properties":{"district":"Tenkasi","district_ta":"தென்காசி"},"geometry":{"type":"Polygon","coordinates":[[[77.2,8.8],[77.7,8.8],[77.7,9.3],[77.2,9.3],[77.2,8.8]]]}},
    {"type":"Feature","properties":{"district":"Tirupattur","district_ta":"திருப்பத்தூர்"},"geometry":{"type":"Polygon","coordinates":[[[78.4,12.4],[78.9,12.4],[78.9,12.9],[78.4,12.9],[78.4,12.4]]]}},
    {"type":"Feature","properties":{"district":"Mayiladuthurai","district_ta":"மயிலாடுதுறை"},"geometry":{"type":"Polygon","coordinates":[[[79.5,11.0],[80.0,11.0],[80.0,11.5],[79.5,11.5],[79.5,11.0]]]}}
  ]
};
