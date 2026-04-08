import type { Place, PlaceCategory } from '@/types/wanderly';

const PLACE_HI_BY_ID: Record<string, string> = {
  p1: 'आमेर किला',
  p2: 'हवा महल',
  p3: 'नाहरगढ़ किला',
  p4: 'सिटी पैलेस',
  p5: 'जंतर मंतर',
  p6: 'टपरी सेंट्रल',
  p7: 'बार पल्लाडियो',
  p8: 'लक्ष्मी मिष्ठान भंडार',
  p9: 'अनोखी मुद्रण संग्रहालय',
  p10: 'जल महल',
  p11: 'जोहरी बाज़ार',
  p12: 'अल्बर्ट हॉल संग्रहालय',
  p13: 'एलीफैंटास्टिक',
  p14: 'पत्रिका गेट',
  p15: 'पन्ना मीणा का कुंड',
  p16: 'क्यूरियस लाइफ कॉफी',
  p17: 'बापू बाज़ार',
  p18: 'चोखी ढाणी',
  p19: 'स्टैचू सर्कल',
  p20: 'गलता जी मंदिर',
  p21: '११३५ ए.डी.',
  p22: 'जयगढ़ किला',
  p23: 'रावत मिष्ठान भंडार',
  p24: 'बिरला मंदिर',
  p25: 'रत्न व आभूषण संग्रहालय',
  p26: 'सामोद हवेली',
  p27: 'सिसोदिया रानी बाग',
  p28: 'निब्स कैफ़े',
  p29: 'राज मन्दिर सिनेमा',
  p30: 'आमेर बावड़ी',
  p31: 'सुवर्ण महल',
  p32: 'ब्लू पॉटरी कार्यशाला',
  p33: 'मसाला चौक',
  p34: 'सांगानेर वस्त्र ग्राम',
  p35: 'विंड व्यू कैफ़े',
};

function fallbackCategoryHi(category: PlaceCategory) {
  switch (category) {
    case 'landmark':
      return 'स्थल';
    case 'restaurant':
      return 'भोजन';
    case 'cafe':
      return 'कैफ़े';
    case 'activity':
      return 'अनुभव';
    case 'shopping':
      return 'बाज़ार';
    default:
      return 'जयपुर';
  }
}

export function placeHindiName(place: Pick<Place, 'id' | 'name' | 'category'>): string {
  return PLACE_HI_BY_ID[place.id] ?? fallbackCategoryHi(place.category);
}
