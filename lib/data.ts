export type RaceType = "road" | "trail";

export interface Race {
  id: string;
  name: string;
  date: string; // ISO 8601
  location: string;
  province: string;
  distance: string;
  type: RaceType;
  url?: string;
  image?: string;
  description?: string;
  discountCode?: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  company: string;
  logo?: string;
  linkCta?: string;
  instagramLink?: string;
  whatsappLink?: string;
}

export interface News {
  id: string;
  title: string;
  subtitle: string;
  link?: string;
}

export const provinces = [
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const races: Race[] = [
  {
    id: "1",
    name: "Patagonia Run",
    date: "2026-04-09T00:00:00Z",
    location: "San Martín de los Andes",
    province: "Neuquén",
    distance: "10k, 21k, 42k, 70k, 110k, 100Mi",
    type: "trail",
    url: "https://www.patagoniarun.com/",
    image:
      "https://images.unsplash.com/photo-1504025468847-0e438279542c?q=80&w=2070&auto=format&fit=crop",
    description:
      "Patagonia Run es una carrera de caminos y senderos de montaña, non-stop, de participación individual, que cuenta con 7 distancias para todos los perfiles de atletas: de los debutantes en el trail-run y corredores de distancias cortas a los ultramaratonistas experimentados en largas distancias y desniveles.",
    discountCode: "PATAGONIA2026",
  },
  {
    id: "2",
    name: "Maratón de Buenos Aires",
    date: "2026-09-22T07:00:00Z",
    location: "CABA",
    province: "Buenos Aires",
    distance: "42k",
    type: "road",
    url: "https://maratondebuenosaires.com/",
    image:
      "https://images.unsplash.com/photo-1730045768278-bb87a2939e71?q=80&w=2070&auto=format&fit=crop",
    description:
      "La Maratón de Buenos Aires es la competencia de 42K más importante de América Latina, recorriendo los lugares más emblemáticos de la ciudad.",
  },
  {
    id: "3",
    name: "El Cruce",
    date: "2026-12-01T00:00:00Z",
    location: "Villa La Angostura",
    province: "Neuquén",
    distance: "100k (3 etapas)",
    type: "trail",
    url: "https://elcruce.com.ar/",
    image:
      "https://images.unsplash.com/photo-1590333748338-d629e4564ad9?q=80&w=1549&auto=format&fit=crop",
    description:
      "El Cruce es una carrera de aventura que cruza la cordillera de los Andes, uniendo Argentina y Chile. Es una experiencia única en el mundo.",
    discountCode: "CRUCE26",
  },
  {
    id: "4",
    name: "Media Maratón de Mendoza",
    date: "2026-03-15T08:00:00Z",
    location: "Mendoza Capital",
    province: "Mendoza",
    distance: "10k, 21k",
    type: "road",
    image:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1700&auto=format&fit=crop",
    description:
      "Disfruta de correr entre viñedos y montañas en la hermosa ciudad de Mendoza.",
  },
  {
    id: "5",
    name: "UTMCC - Ultra Trail Comechingones",
    date: "2026-07-08T05:00:00Z",
    location: "Villa Yacanto",
    province: "Córdoba",
    distance: "16k, 26k, 40k, 55k, 80k, 110k",
    type: "trail",
    url: "https://utcc.com.ar/",
    image:
      "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=1472&auto=format&fit=crop",
    description:
      "Una de las ultras más duras y técnicas de Argentina en las sierras grandes de Córdoba.",
    discountCode: "UTMCC10OFF",
  },
  {
    id: "6",
    name: "Tandil Adventure",
    date: "2026-01-15T09:00:00Z",
    location: "Tandil",
    province: "Buenos Aires",
    distance: "10k, 21k",
    type: "trail",
    image:
      "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=1470&auto=format&fit=crop",
    description: "Carrera de aventura en las sierras más antiguas del mundo.",
  },
  {
    id: "7",
    name: "Carrera Nocturna Sonder",
    date: "2026-02-20T20:00:00Z",
    location: "Rosario",
    province: "Santa Fe",
    distance: "10k",
    type: "road",
    image:
      "https://plus.unsplash.com/premium_photo-1664537975122-9c598d85816e?q=80&w=1470&auto=format&fit=crop",
    description:
      "La clásica nocturna de Rosario, recorriendo la costanera junto al río Paraná.",
  },
];
