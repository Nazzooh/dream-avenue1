// Dream Avenue Convention Center - Contact Information
export const CONTACT_INFO = {
  address: {
    street: "Feroke Road",
    area: "Karuvanthiruthy",
    city: "Kozhikode",
    state: "Kerala",
    pincode: "673631",
    fullAddress: "Feroke Road, Karuvanthiruthy, Kozhikode, Kerala 673631",
    location: "Ground Floor Office"
  },
  
  phones: {
    main: "+91 86062 06096",
    whatsapp: "+91 86062 06096",
    booking: "0495 248 6096",
    
    // Formatted for display
    mainFormatted: "+91 860 620 6096",
    bookingFormatted: "0495 248 6096"
  },
  
  emails: {
    primary: "dream-avenue.krt@gmail.com",
    secondary: "koyaferoke@gmail.com"
  },
  
  officeHours: {
    weekdays: "Monday - Saturday: 9:00 AM - 6:00 PM",
    weekends: "Sunday: By Appointment Only",
    
    // Detailed format
    detailed: {
      monday: "9:00 AM - 6:00 PM",
      tuesday: "9:00 AM - 6:00 PM",
      wednesday: "9:00 AM - 6:00 PM",
      thursday: "9:00 AM - 6:00 PM",
      friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 6:00 PM",
      sunday: "By Appointment Only"
    }
  },
  
  // Social/Messaging Links
  links: {
    whatsapp: "https://wa.me/918606206096",
    whatsappWithMessage: (message: string) => 
      `https://wa.me/918606206096?text=${encodeURIComponent(message)}`,
    googleMaps: "https://maps.google.com/?q=Feroke+Road+Karuvanthiruthy+Kozhikode+Kerala+673631",
    email: "mailto:dream-avenue.krt@gmail.com"
  }
} as const;

// Helper function to format phone numbers
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  
  return phone;
};
